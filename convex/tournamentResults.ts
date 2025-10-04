import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Clear all tournament results
export const clearAllResults = mutation({
  handler: async (ctx) => {
    const BATCH_SIZE = 50;
    let deleted = 0;

    let results = await ctx.db.query("tournamentResults").take(BATCH_SIZE);
    while (results.length > 0) {
      for (const result of results) {
        await ctx.db.delete(result._id);
        deleted++;
      }
      results = await ctx.db.query("tournamentResults").take(BATCH_SIZE);
    }

    return { deleted };
  },
});

// Import tournament results from JSON format
export const importResultsJSON = mutation({
  args: {
    playerName: v.string(),
    years: v.array(
      v.object({
        year: v.number(),
        tournaments: v.array(
          v.object({
            date: v.string(),
            tournament: v.string(),
            position: v.string(),
            score: v.string(),
            overall: v.string(),
            earnings: v.number(),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Find the player by name
    const players = await ctx.db
      .query("players")
      .withSearchIndex("search_name", (q) => q.search("name", args.playerName))
      .take(1);

    if (players.length === 0) {
      throw new Error(`Player not found: ${args.playerName}`);
    }

    const player = players[0];
    let imported = 0;
    const errors: string[] = [];

    // Process each year
    for (const yearData of args.years) {
      for (const tournament of yearData.tournaments) {
        try {
          await ctx.db.insert("tournamentResults", {
            playerId: player._id,
            playerName: args.playerName,
            year: yearData.year,
            date: tournament.date,
            tournament: tournament.tournament,
            position: tournament.position,
            score: tournament.score,
            overall: tournament.overall,
            earnings: tournament.earnings,
          });
          imported++;
        } catch (error) {
          errors.push(`Failed: ${yearData.year} - ${tournament.tournament}`);
        }
      }
    }

    return {
      imported,
      errors,
      playerName: args.playerName,
    };
  },
});

// Import batch of players' results
export const importBatchResultsJSON = mutation({
  args: {
    players: v.array(
      v.object({
        playerName: v.string(),
        years: v.array(
          v.object({
            year: v.number(),
            tournaments: v.array(
              v.object({
                date: v.string(),
                tournament: v.string(),
                position: v.string(),
                score: v.string(),
                overall: v.string(),
                earnings: v.number(),
              })
            ),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const summary = {
      totalImported: 0,
      playersProcessed: 0,
      errors: [] as string[],
    };

    for (const playerData of args.players) {
      try {
        // Find the player
        const players = await ctx.db
          .query("players")
          .withSearchIndex("search_name", (q) => q.search("name", playerData.playerName))
          .take(1);

        if (players.length === 0) {
          summary.errors.push(`Player not found: ${playerData.playerName}`);
          continue;
        }

        const player = players[0];

        // Import their results
        for (const yearData of playerData.years) {
          for (const tournament of yearData.tournaments) {
            try {
              await ctx.db.insert("tournamentResults", {
                playerId: player._id,
                playerName: playerData.playerName,
                year: yearData.year,
                date: tournament.date,
                tournament: tournament.tournament,
                position: tournament.position,
                score: tournament.score,
                overall: tournament.overall,
                earnings: tournament.earnings,
              });
              summary.totalImported++;
            } catch (error) {
              // Continue on individual tournament errors
            }
          }
        }

        summary.playersProcessed++;
      } catch (error) {
        summary.errors.push(`Failed processing: ${playerData.playerName}`);
      }
    }

    return summary;
  },
});

// Check import status
export const checkResultsStatus = query({
  handler: async (ctx) => {
    const totalResults = await ctx.db.query("tournamentResults").take(1000);

    // Group by player
    const playerCounts: Record<string, number> = {};
    const yearCounts: Record<number, number> = {};

    for (const result of totalResults) {
      playerCounts[result.playerName] = (playerCounts[result.playerName] || 0) + 1;
      yearCounts[result.year] = (yearCounts[result.year] || 0) + 1;
    }

    // Get sample results for Scottie Scheffler
    const sampleResults = await ctx.db
      .query("tournamentResults")
      .filter((q) => q.eq(q.field("playerName"), "Scottie Scheffler"))
      .take(10);

    return {
      totalResults: totalResults.length,
      uniquePlayers: Object.keys(playerCounts).length,
      playerCounts: Object.entries(playerCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10),
      yearCounts: Object.entries(yearCounts)
        .sort(([a], [b]) => Number(b) - Number(a)),
      sampleScottie: sampleResults.map(r => ({
        year: r.year,
        tournament: r.tournament,
        position: r.position,
        earnings: r.earnings,
      })),
    };
  },
});

// Import tournament results from CSV data (legacy)
export const importTournamentResults = mutation({
  args: {
    results: v.array(
      v.object({
        name: v.string(),
        year: v.number(),
        date: v.string(),
        tournament: v.string(),
        position: v.string(),
        score: v.string(),
        overall: v.string(),
        earnings: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const importResults = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const result of args.results) {
      try {
        // Try to find the player by name
        const players = await ctx.db
          .query("players")
          .withSearchIndex("search_name", (q) => q.search("name", result.name))
          .take(1);

        let playerId: any = null;

        if (players.length > 0) {
          playerId = players[0]._id;
        } else {
          // Create a new player if not found (basic info from name)
          const nameParts = result.name.split(" ");
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(" ");

          playerId = await ctx.db.insert("players", {
            name: result.name,
            firstName,
            lastName,
            country: "Unknown",
            countryCode: "US", // Default to US
          });
        }

        // Insert the tournament result
        await ctx.db.insert("tournamentResults", {
          playerId,
          playerName: result.name,
          year: result.year,
          date: result.date,
          tournament: result.tournament,
          position: result.position,
          score: result.score,
          overall: result.overall,
          earnings: result.earnings,
        });

        importResults.success++;
      } catch (error) {
        importResults.failed++;
        importResults.errors.push(
          `Failed to import result for ${result.name} at ${result.tournament}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    return importResults;
  },
});

// Get tournament results for a player
export const getPlayerTournamentResults = query({
  args: {
    playerId: v.id("players"),
    year: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("tournamentResults")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId));

    const results = await query.collect();

    // Filter by year if provided
    const filtered = args.year
      ? results.filter((r) => r.year === args.year)
      : results;

    // Sort by date (most recent first)
    return filtered.sort((a, b) => {
      // Parse dates and compare
      const dateA = new Date(a.date.split(" - ")[0] + "/" + a.year);
      const dateB = new Date(b.date.split(" - ")[0] + "/" + b.year);
      return dateB.getTime() - dateA.getTime();
    });
  },
});

// Get all unique tournaments
export const getAllTournaments = query({
  handler: async (ctx) => {
    const results = await ctx.db.query("tournamentResults").collect();
    const tournaments = [...new Set(results.map((r) => r.tournament))];
    return tournaments.sort();
  },
});

// Get results for a specific tournament
export const getTournamentResults = query({
  args: {
    tournament: v.string(),
    year: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("tournamentResults")
      .withIndex("by_tournament", (q) => q.eq("tournament", args.tournament))
      .collect();

    // Filter by year if provided
    const filtered = args.year
      ? results.filter((r) => r.year === args.year)
      : results;

    // Sort by position (handling special cases like "Missed Cut", "T1", etc.)
    return filtered.sort((a, b) => {
      // Helper function to extract numeric position
      const getPositionValue = (pos: string) => {
        if (pos === "Missed Cut" || pos === "MC") return 999;
        if (pos === "WD" || pos === "DQ") return 1000;

        // Remove "T" prefix if present
        const numStr = pos.replace("T", "");
        return parseInt(numStr) || 1001;
      };

      return getPositionValue(a.position) - getPositionValue(b.position);
    });
  },
});

// Delete all tournament results (for admin use)
export const deleteAllTournamentResults = mutation({
  handler: async (ctx) => {
    const results = await ctx.db.query("tournamentResults").collect();
    for (const result of results) {
      await ctx.db.delete(result._id);
    }
    return { deleted: results.length };
  },
});

// Delete one batch of tournament data (progressive deletion to stay under 4,096 read limit)
export const clearTournamentDataBatch = mutation({
  handler: async (ctx) => {
    const BATCH_SIZE = 50; // Conservative batch size to stay under 4,096 read limit

    // Try tournament results first
    const results = await ctx.db.query("tournamentResults").take(BATCH_SIZE);
    if (results.length > 0) {
      for (const result of results) {
        await ctx.db.delete(result._id);
      }
      return {
        table: "tournamentResults",
        deleted: results.length,
        hasMore: true,
      };
    }

    // Then round stats
    const roundStats = await ctx.db.query("roundStats").take(BATCH_SIZE);
    if (roundStats.length > 0) {
      for (const stat of roundStats) {
        await ctx.db.delete(stat._id);
      }
      return {
        table: "roundStats",
        deleted: roundStats.length,
        hasMore: true,
      };
    }

    // Finally player course stats
    const playerStats = await ctx.db.query("playerCourseStats").take(BATCH_SIZE);
    if (playerStats.length > 0) {
      for (const stat of playerStats) {
        await ctx.db.delete(stat._id);
      }
      return {
        table: "playerCourseStats",
        deleted: playerStats.length,
        hasMore: true,
      };
    }

    // All tables empty
    return {
      table: "complete",
      deleted: 0,
      hasMore: false,
    };
  },
});

// Get counts for progress tracking
export const getTournamentDataCounts = query({
  handler: async (ctx) => {
    const results = await ctx.db.query("tournamentResults").take(100);
    const roundStats = await ctx.db.query("roundStats").take(100);
    const playerStats = await ctx.db.query("playerCourseStats").take(100);

    return {
      hasResults: results.length > 0,
      hasRoundStats: roundStats.length > 0,
      hasPlayerStats: playerStats.length > 0,
    };
  },
});