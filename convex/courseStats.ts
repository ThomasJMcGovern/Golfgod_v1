import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all courses (PAGINATED)
export const getAllCourses = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 100, 500); // Default 100, max 500
    return await ctx.db.query("courses").take(limit);
  },
});

// Get course by name
export const getCourseByName = query({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

// Get tournaments played at a specific course (PAGINATED)
export const getTournamentsAtCourse = query({
  args: {
    courseId: v.id("courses"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 50, 200); // Default 50, max 200

    const mappings = await ctx.db
      .query("tournamentCourses")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .take(limit);

    return mappings;
  },
});

// Get player's performance at a specific course
export const getPlayerCourseStats = query({
  args: {
    playerId: v.id("players"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    // First check if we have cached stats
    const cachedStats = await ctx.db
      .query("playerCourseStats")
      .withIndex("by_player_course", (q) =>
        q.eq("playerId", args.playerId).eq("courseId", args.courseId)
      )
      .first();

    if (cachedStats) {
      return cachedStats;
    }

    // If not cached, calculate from tournament results
    // This is a simplified version - we'll need course mapping first
    return null;
  },
});

// Get individual tournament history for a player at a specific course
export const getPlayerTournamentHistoryAtCourse = query({
  args: {
    playerId: v.id("players"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    // Get the course to find its name
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      return [];
    }

    // Get all tournament results for this player at this course
    const results = await ctx.db
      .query("tournamentResults")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .filter((q) => q.eq(q.field("course"), course.name))
      .collect();

    // Sort by year (most recent first)
    const sortedResults = results.sort((a, b) => b.year - a.year);

    // Format and return
    return sortedResults.map((result) => {
      // Determine if cut was made based on position field or number of rounds
      const position = result.position?.toUpperCase() || "";
      const positionIndicatesMC = position.includes("MC") || position.includes("CUT") || position.includes("WD");
      const hasOnlyTwoRounds = result.scores && result.scores.length === 2;
      const missedCut = positionIndicatesMC || hasOnlyTwoRounds;

      // If position is "Unknown" and player has only 2 rounds, they missed the cut
      const displayPosition = (position === "UNKNOWN" && hasOnlyTwoRounds) ? "MC" : result.position;

      return {
        year: result.year,
        tournament: result.tournament,
        position: displayPosition,
        scores: result.scores || [],
        totalScore: result.totalScore,
        toPar: result.toPar,
        earnings: result.earnings,
        madeCut: !missedCut,
        scorecard: result.scores && result.scores.length > 0 ? result.scores.join("-") : "",
      };
    });
  },
});

// Get all player stats for a specific course (PAGINATED)
export const getAllPlayersAtCourse = query({
  args: {
    courseId: v.id("courses"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 50, 200); // Default 50, max 200

    const stats = await ctx.db
      .query("playerCourseStats")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .take(limit);

    // Join with player data
    const playersWithStats = await Promise.all(
      stats.map(async (stat) => {
        const player = await ctx.db.get(stat.playerId);
        return {
          ...stat,
          playerName: player?.name || "Unknown",
          playerCountry: player?.country || "Unknown",
        };
      })
    );

    // Sort by scoring average
    return playersWithStats.sort((a, b) => a.scoringAverage - b.scoringAverage);
  },
});

// Calculate and cache player course statistics
export const calculatePlayerCourseStats = mutation({
  args: {
    playerId: v.id("players"),
    courseId: v.id("courses"),
    tournamentName: v.string(), // Used to find historical results
  },
  handler: async (ctx, args) => {
    // Get all tournament results for this player at tournaments associated with this course
    const courseMapping = await ctx.db
      .query("tournamentCourses")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .filter((q) => q.eq(q.field("tournamentName"), args.tournamentName))
      .first();

    if (!courseMapping) {
      throw new Error("No tournament mapping found for this course");
    }

    // Get all results for this player at this tournament
    const results = await ctx.db
      .query("tournamentResults")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .filter((q) => q.eq(q.field("tournament"), args.tournamentName))
      .collect();

    if (results.length === 0) {
      return { message: "No results found for this player at this course" };
    }

    // Calculate statistics
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

    // Round-specific totals
    let r1Scores: number[] = [];
    let r2Scores: number[] = [];
    let r3Scores: number[] = [];
    let r4Scores: number[] = [];

    for (const result of results) {
      cutsPlayed++;

      // Check if made cut (has scores array with more than 2 rounds)
      const madecut = result.scores && result.scores.length > 2;
      if (madecut) {
        cutsMade++;
      }

      // Process scores
      if (result.scores) {
        result.scores.forEach((score, index) => {
          const scoreNum = parseInt(score);
          if (!isNaN(scoreNum)) {
            totalStrokes += scoreNum;
            totalRounds++;

            if (scoreNum < bestScore) bestScore = scoreNum;
            if (scoreNum > worstScore) worstScore = scoreNum;

            // Track by round
            if (index === 0) r1Scores.push(scoreNum);
            else if (index === 1) r2Scores.push(scoreNum);
            else if (index === 2) r3Scores.push(scoreNum);
            else if (index === 3) r4Scores.push(scoreNum);
          }
        });
      }

      // Process position
      const position = result.position;
      const posNum = parseInt(position.replace(/[^0-9]/g, ''));

      if (!isNaN(posNum)) {
        if (posNum === 1) wins++;
        if (posNum <= 10) top10s++;
        if (posNum <= 25) top25s++;
      }

      // Add earnings
      if (result.earnings) {
        totalEarnings += result.earnings;
      }
    }

    // Calculate averages
    const scoringAverage = totalRounds > 0 ? totalStrokes / totalRounds : 0;
    const avgR1Score = r1Scores.length > 0 ? r1Scores.reduce((a, b) => a + b, 0) / r1Scores.length : undefined;
    const avgR2Score = r2Scores.length > 0 ? r2Scores.reduce((a, b) => a + b, 0) / r2Scores.length : undefined;
    const avgR3Score = r3Scores.length > 0 ? r3Scores.reduce((a, b) => a + b, 0) / r3Scores.length : undefined;
    const avgR4Score = r4Scores.length > 0 ? r4Scores.reduce((a, b) => a + b, 0) / r4Scores.length : undefined;

    const earlyScores = [...r1Scores, ...r2Scores];
    const weekendScores = [...r3Scores, ...r4Scores];
    const avgEarlyScore = earlyScores.length > 0 ? earlyScores.reduce((a, b) => a + b, 0) / earlyScores.length : undefined;
    const avgWeekendScore = weekendScores.length > 0 ? weekendScores.reduce((a, b) => a + b, 0) / weekendScores.length : undefined;

    // Check if stats already exist
    const existing = await ctx.db
      .query("playerCourseStats")
      .withIndex("by_player_course", (q) =>
        q.eq("playerId", args.playerId).eq("courseId", args.courseId)
      )
      .first();

    const stats = {
      playerId: args.playerId,
      courseId: args.courseId,
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
      avgR1Score,
      avgR2Score,
      avgR3Score,
      avgR4Score,
      avgEarlyScore,
      avgWeekendScore,
      lastUpdated: Date.now(),
      lastTournamentYear: Math.max(...results.map(r => r.year)),
    };

    if (existing) {
      await ctx.db.patch(existing._id, stats);
      return { message: "Stats updated", stats };
    } else {
      await ctx.db.insert("playerCourseStats", stats);
      return { message: "Stats created", stats };
    }
  },
});

// Add a new course
export const addCourse = mutation({
  args: {
    name: v.string(),
    location: v.string(),
    par: v.number(),
    yardage: v.optional(v.number()),
    established: v.optional(v.number()),
    designer: v.optional(v.string()),
    type: v.optional(v.string()),
    grassType: v.optional(v.string()),
    stimpmeter: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if course already exists
    const existing = await ctx.db
      .query("courses")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      throw new Error("Course already exists");
    }

    const courseId = await ctx.db.insert("courses", args);
    return courseId;
  },
});

// Map a tournament to a course
export const mapTournamentToCourse = mutation({
  args: {
    tournamentName: v.string(),
    courseId: v.id("courses"),
    yearStart: v.number(),
    yearEnd: v.optional(v.number()),
    isPrimary: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if mapping already exists
    const existing = await ctx.db
      .query("tournamentCourses")
      .withIndex("by_tournament", (q) => q.eq("tournamentName", args.tournamentName))
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .first();

    if (existing) {
      // Update existing mapping
      await ctx.db.patch(existing._id, {
        yearStart: args.yearStart,
        yearEnd: args.yearEnd,
        isPrimary: args.isPrimary,
      });
      return { message: "Mapping updated", id: existing._id };
    } else {
      // Create new mapping
      const id = await ctx.db.insert("tournamentCourses", args);
      return { message: "Mapping created", id };
    }
  },
});

// Seed some popular courses with their tournament mappings
export const seedPopularCourses = mutation({
  handler: async (ctx) => {
    const coursesData = [
      {
        course: {
          name: "TPC Sawgrass",
          location: "Ponte Vedra Beach, Florida",
          par: 72,
          yardage: 7245,
          established: 1980,
          designer: "Pete Dye",
          type: "Stadium",
          grassType: "Bermuda",
        },
        tournament: "THE PLAYERS Championship",
      },
      {
        course: {
          name: "Augusta National",
          location: "Augusta, Georgia",
          par: 72,
          yardage: 7510,
          established: 1933,
          designer: "Alister MacKenzie & Bobby Jones",
          type: "Parkland",
          grassType: "Bermuda/Bentgrass",
        },
        tournament: "Masters Tournament",
      },
      {
        course: {
          name: "Pebble Beach Golf Links",
          location: "Pebble Beach, California",
          par: 72,
          yardage: 6972,
          established: 1919,
          designer: "Jack Neville & Douglas Grant",
          type: "Links",
          grassType: "Poa Annua",
        },
        tournament: "AT&T Pebble Beach Pro-Am",
      },
      {
        course: {
          name: "TPC Scottsdale",
          location: "Scottsdale, Arizona",
          par: 71,
          yardage: 7261,
          established: 1986,
          designer: "Tom Weiskopf & Jay Morrish",
          type: "Desert",
          grassType: "Bermuda",
        },
        tournament: "WM Phoenix Open",
      },
      {
        course: {
          name: "Bay Hill Club & Lodge",
          location: "Orlando, Florida",
          par: 72,
          yardage: 7466,
          established: 1961,
          designer: "Dick Wilson",
          type: "Parkland",
          grassType: "Bermuda",
        },
        tournament: "Arnold Palmer Invitational presented by Mastercard",
      },
    ];

    let created = 0;
    let mapped = 0;

    for (const data of coursesData) {
      try {
        // Check if course exists
        let course = await ctx.db
          .query("courses")
          .withIndex("by_name", (q) => q.eq("name", data.course.name))
          .first();

        if (!course) {
          const courseId = await ctx.db.insert("courses", data.course);
          course = await ctx.db.get(courseId);
          created++;
        }

        // Skip if course still doesn't exist
        if (!course) continue;

        // Create tournament mapping
        const existingMapping = await ctx.db
          .query("tournamentCourses")
          .withIndex("by_tournament", (q) => q.eq("tournamentName", data.tournament))
          .first();

        if (!existingMapping) {
          await ctx.db.insert("tournamentCourses", {
            tournamentName: data.tournament,
            courseId: course._id,
            yearStart: 2015,
            yearEnd: undefined, // Still current
            isPrimary: true,
          });
          mapped++;
        }
      } catch (error) {
        console.error(`Error seeding ${data.course.name}:`, error);
      }
    }

    return {
      message: `Seeded ${created} courses and ${mapped} tournament mappings`,
      coursesCreated: created,
      mappingsCreated: mapped,
    };
  },
});