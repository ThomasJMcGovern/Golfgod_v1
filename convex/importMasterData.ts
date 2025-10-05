import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import {
  parseCourseInfo,
  parseEarnings,
  parseScoreToPar,
  parseTotalScore,
  cleanPosition,
  extractUniqueCourses,
  validateRounds,
  getCourseKey,
  madeCut,
  parseDate,
} from "./utils/dataProcessing";

// Step 1: Import courses from master data
export const importCourses = mutation({
  args: {
    masterData: v.any(),
  },
  handler: async (ctx, args) => {
    const uniqueCourses = extractUniqueCourses(args.masterData);
    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const courseData of uniqueCourses) {
      try {
        // Check if course already exists
        const existing = await ctx.db
          .query("courses")
          .withIndex("by_name", (q) => q.eq("name", courseData.name))
          .first();

        if (existing) {
          skipped++;
          continue;
        }

        // Create new course
        await ctx.db.insert("courses", {
          name: courseData.name,
          location: "Unknown", // Will be enriched later
          par: 72, // Default, will be enriched later
          yardage: undefined,
          established: undefined,
          designer: undefined,
          type: courseData.variant,
          grassType: undefined,
          stimpmeter: undefined,
        });

        created++;
      } catch (error) {
        errors.push(`Failed to import course ${courseData.name}: ${error}`);
      }
    }

    return {
      created,
      skipped,
      errors,
      total: uniqueCourses.length,
    };
  },
});

// Step 2: Create tournament-to-course mappings
export const createTournamentMappings = mutation({
  args: {
    masterData: v.any(),
  },
  handler: async (ctx, args) => {
    const mappings = new Map<string, { tournamentName: string; courseName: string }>();

    // Extract unique tournament-course pairs
    for (const player of args.masterData.players) {
      for (const tournament of player.tournaments) {
        if (!tournament.course_name) continue;

        const key = `${tournament.tournament_name}::${tournament.course_name}`;
        if (!mappings.has(key)) {
          mappings.set(key, {
            tournamentName: tournament.tournament_name,
            courseName: tournament.course_name,
          });
        }
      }
    }

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const mapping of mappings.values()) {
      try {
        const courseInfo = parseCourseInfo(mapping.courseName);

        // Find the course
        const course = await ctx.db
          .query("courses")
          .withIndex("by_name", (q) => q.eq("name", courseInfo.name))
          .first();

        if (!course) {
          errors.push(`Course not found: ${courseInfo.name}`);
          continue;
        }

        // Check if mapping exists
        const existing = await ctx.db
          .query("tournamentCourses")
          .withIndex("by_tournament", (q) => q.eq("tournamentName", mapping.tournamentName))
          .filter((q) => q.eq(q.field("courseId"), course._id))
          .first();

        if (existing) {
          skipped++;
          continue;
        }

        // Create mapping
        await ctx.db.insert("tournamentCourses", {
          tournamentName: mapping.tournamentName,
          courseId: course._id,
          yearStart: 2015, // Default
          yearEnd: undefined,
          isPrimary: true,
        });

        created++;
      } catch (error) {
        errors.push(`Failed to create mapping: ${error}`);
      }
    }

    return {
      created,
      skipped,
      errors,
      total: mappings.size,
    };
  },
});

// Step 3: Import tournament results (batched)
export const importTournamentResultsBatch = mutation({
  args: {
    playerData: v.object({
      player_id: v.string(),
      player_name: v.string(),
      espn_url: v.optional(v.string()),
      total_tournaments: v.optional(v.number()),
      tournaments: v.array(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Find or create player
    let player = await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("espnId"), args.playerData.player_id))
      .first();

    if (!player) {
      // Try by name
      const byName = await ctx.db
        .query("players")
        .withSearchIndex("search_name", (q) => q.search("name", args.playerData.player_name))
        .first();

      if (byName) {
        player = byName;
        // Update ESPN ID
        await ctx.db.patch(byName._id, { espnId: args.playerData.player_id });
      } else {
        // Create new player
        const nameParts = args.playerData.player_name.split(" ");
        const playerId = await ctx.db.insert("players", {
          name: args.playerData.player_name,
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(" "),
          country: "Unknown",
          countryCode: "US",
          espnId: args.playerData.player_id,
        });

        player = await ctx.db.get(playerId);
      }
    }

    if (!player) {
      return { imported: 0, skipped: 0, errors: ["Failed to create/find player"] };
    }

    // Import each tournament
    for (const tournament of args.playerData.tournaments) {
      try {
        // Find course
        const courseInfo = parseCourseInfo(tournament.course_name || "");
        const course = await ctx.db
          .query("courses")
          .withIndex("by_name", (q) => q.eq("name", courseInfo.name))
          .first();

        if (!course) {
          errors.push(`Course not found for tournament: ${tournament.tournament_name}`);
          skipped++;
          continue;
        }

        // Check if result already exists
        const existing = await ctx.db
          .query("tournamentResults")
          .withIndex("by_player_year", (q) =>
            q.eq("playerId", player!._id).eq("year", tournament.year)
          )
          .filter((q) => q.eq(q.field("tournament"), tournament.tournament_name))
          .first();

        if (existing) {
          skipped++;
          continue;
        }

        // Validate and clean data
        const rounds = validateRounds(tournament.rounds || []);
        const position = cleanPosition(tournament.finish);
        const earnings = parseEarnings(tournament.earnings);
        const toPar = parseScoreToPar(tournament.score_to_par);
        const totalScore = parseTotalScore(tournament.total_score);

        // Insert tournament result
        await ctx.db.insert("tournamentResults", {
          playerId: player._id,
          playerName: args.playerData.player_name,
          year: tournament.year,
          date: tournament.date || `${tournament.year}`,
          tournament: tournament.tournament_name,
          course: course.name,
          position,
          scores: rounds.map(String),
          totalScore,
          toPar,
          score: tournament.score_to_par || "E",
          overall: tournament.total_score || "0",
          earnings,
        });

        imported++;

        // Create round stats if we have round data
        if (rounds.length > 0) {
          const resultId = (await ctx.db
            .query("tournamentResults")
            .withIndex("by_player_year", (q) =>
              q.eq("playerId", player!._id).eq("year", tournament.year)
            )
            .filter((q) => q.eq(q.field("tournament"), tournament.tournament_name))
            .first())!._id;

          for (let i = 0; i < rounds.length; i++) {
            await ctx.db.insert("roundStats", {
              playerId: player._id,
              courseId: course._id,
              tournamentResultId: resultId,
              year: tournament.year,
              round: i + 1,
              score: rounds[i],
              toPar: rounds[i] - (course.par || 72),
            });
          }
        }
      } catch (error) {
        errors.push(`Failed to import tournament ${tournament.tournament_name}: ${error}`);
        skipped++;
      }
    }

    return {
      imported,
      skipped,
      errors,
      playerName: args.playerData.player_name,
      playerId: player._id,
    };
  },
});

// Step 4: Calculate player-course statistics for a SINGLE player (batched approach)
export const calculatePlayerCourseStats = mutation({
  args: {
    playerId: v.id("players"),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) {
      return { calculated: 0, errors: ["Player not found"] };
    }

    let calculated = 0;
    let errors: string[] = [];

    try {
      // Get all tournament results for this player
      const results = await ctx.db
        .query("tournamentResults")
        .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
        .collect();

      // Group by course
      const courseResults = new Map<string, typeof results>();

      for (const result of results) {
        if (!result.course) continue;

        const courseKey = result.course;
        if (!courseResults.has(courseKey)) {
          courseResults.set(courseKey, []);
        }
        courseResults.get(courseKey)!.push(result);
      }

      // Calculate stats for each course
      for (const [courseName, courseResultsList] of courseResults.entries()) {
        // Find course ID
        const course = await ctx.db
          .query("courses")
          .withIndex("by_name", (q) => q.eq("name", courseName))
          .first();

        if (!course) continue;

        // Calculate aggregated stats
        let totalStrokes = 0;
        let totalRounds = 0;
        let bestScore = Infinity;
        let worstScore = -Infinity;
        let cutsPlayed = 0;
        let cutsMade = 0;
        let wins = 0;
        let top10s = 0;
        let top25s = 0;
        let totalEarnings = 0;

        const r1Scores: number[] = [];
        const r2Scores: number[] = [];
        const r3Scores: number[] = [];
        const r4Scores: number[] = [];

        for (const result of courseResultsList) {
          cutsPlayed++;

          if (result.scores) {
            const madeTheCut = madeCut(result.position, result.scores.map(s => parseInt(s)));
            if (madeTheCut) cutsMade++;

            result.scores.forEach((score, index) => {
              const scoreNum = parseInt(score);
              if (!isNaN(scoreNum)) {
                totalStrokes += scoreNum;
                totalRounds++;

                if (scoreNum < bestScore) bestScore = scoreNum;
                if (scoreNum > worstScore) worstScore = scoreNum;

                if (index === 0) r1Scores.push(scoreNum);
                else if (index === 1) r2Scores.push(scoreNum);
                else if (index === 2) r3Scores.push(scoreNum);
                else if (index === 3) r4Scores.push(scoreNum);
              }
            });
          }

          const posNum = parseInt(result.position.replace(/[^0-9]/g, ''));
          if (!isNaN(posNum)) {
            if (posNum === 1) wins++;
            if (posNum <= 10) top10s++;
            if (posNum <= 25) top25s++;
          }

          if (result.earnings) totalEarnings += result.earnings;
        }

        const scoringAverage = totalRounds > 0 ? totalStrokes / totalRounds : 0;
        const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : undefined;

        const stats = {
          playerId: player._id,
          courseId: course._id,
          roundsPlayed: totalRounds,
          scoringAverage,
          bestScore: bestScore === Infinity ? 0 : bestScore,
          worstScore: worstScore === -Infinity ? 0 : worstScore,
          cutsPlayed,
          cutsMade,
          wins,
          top10s,
          top25s,
          totalEarnings,
          avgR1Score: avg(r1Scores),
          avgR2Score: avg(r2Scores),
          avgR3Score: avg(r3Scores),
          avgR4Score: avg(r4Scores),
          avgEarlyScore: avg([...r1Scores, ...r2Scores]),
          avgWeekendScore: avg([...r3Scores, ...r4Scores]),
          lastUpdated: Date.now(),
          lastTournamentYear: Math.max(...courseResultsList.map(r => r.year)),
        };

        // Check if stats exist
        const existing = await ctx.db
          .query("playerCourseStats")
          .withIndex("by_player_course", (q) =>
            q.eq("playerId", player._id).eq("courseId", course._id)
          )
          .first();

        if (existing) {
          await ctx.db.patch(existing._id, stats);
        } else {
          await ctx.db.insert("playerCourseStats", stats);
        }

        calculated++;
      }
    } catch (error) {
      errors.push(`Failed to calculate stats for ${player.name}: ${error}`);
    }

    return {
      calculated,
      errors,
      playerName: player.name,
    };
  },
});

// Helper query to get all players for batched processing (PAGINATED)
export const getAllPlayers = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 200, 500); // Default 200, max 500
    return await ctx.db.query("players").take(limit);
  },
});

// Query to get import status (OPTIMIZED - uses existence checks instead of counting)
export const getImportStatus = query({
  handler: async (ctx) => {
    // Use .take(1) to check existence instead of counting all documents
    // This prevents "Nearing documents read limit" errors
    const hasCourses = await ctx.db.query("courses").take(1);
    const hasMappings = await ctx.db.query("tournamentCourses").take(1);
    const hasPlayers = await ctx.db.query("players").take(1);

    return {
      courses: hasCourses.length,
      tournamentMappings: hasMappings.length,
      players: hasPlayers.length,
      status: {
        coursesImported: hasCourses.length > 0,
        mappingsImported: hasMappings.length > 0,
        playersImported: hasPlayers.length > 0,
      },
    };
  },
});
