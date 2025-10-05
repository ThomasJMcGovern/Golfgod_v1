import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const BATCH_SIZE = 50; // Optimal batch size for Convex operations

// Unified clear database function with table options
export const clearDatabase = mutation({
  args: {
    tables: v.optional(
      v.array(
        v.union(
          v.literal("players"),
          v.literal("playerStats"),
          v.literal("tournamentResults"),
          v.literal("userFollows"),
          v.literal("all")
        )
      )
    ),
  },
  handler: async (ctx, args) => {
    const tablesToClear = args.tables || ["all"];
    const results = {
      players: 0,
      playerStats: 0,
      tournamentResults: 0,
      userFollows: 0,
      total: 0,
    };

    // Helper function to clear a table in batches
    const clearTable = async (tableName: string) => {
      let deleted = 0;
      let hasMore = true;

      while (hasMore) {
        const records = await ctx.db
          .query(tableName as any)
          .take(BATCH_SIZE);

        if (records.length === 0) {
          hasMore = false;
        } else {
          for (const record of records) {
            await ctx.db.delete(record._id);
            deleted++;
          }
        }
      }

      return deleted;
    };

    // Clear specified tables
    if (tablesToClear.includes("all") || tablesToClear.includes("players")) {
      results.players = await clearTable("players");
    }

    if (tablesToClear.includes("all") || tablesToClear.includes("playerStats")) {
      results.playerStats = await clearTable("playerStats");
    }

    if (tablesToClear.includes("all") || tablesToClear.includes("tournamentResults")) {
      results.tournamentResults = await clearTable("tournamentResults");
    }

    if (tablesToClear.includes("all") || tablesToClear.includes("userFollows")) {
      results.userFollows = await clearTable("userFollows");
    }

    results.total =
      results.players +
      results.playerStats +
      results.tournamentResults +
      results.userFollows;

    return {
      success: true,
      deleted: results,
      message: `Cleared ${results.total} records from database`,
    };
  },
});

// Clear tournament results only - with smaller batches to avoid read limits
export const clearTournamentResults = mutation({
  handler: async (ctx) => {
    let deleted = 0;
    let hasMore = true;
    const SMALL_BATCH = 20; // Smaller batch to avoid hitting read limits

    while (hasMore) {
      const results = await ctx.db
        .query("tournamentResults")
        .take(SMALL_BATCH);

      if (results.length === 0) {
        hasMore = false;
      } else {
        // Delete in this batch
        for (const result of results) {
          await ctx.db.delete(result._id);
          deleted++;
        }

        // If we're hitting limits, return early and let client retry
        if (deleted >= 1000) {
          return {
            success: true,
            deleted,
            message: `Deleted ${deleted} tournament results (batch complete, may need to run again)`,
            hasMore: true
          };
        }
      }
    }

    return {
      success: true,
      deleted,
      message: `Deleted all ${deleted} tournament results`,
      hasMore: false
    };
  },
});

// Clear player data with cascade (BATCHED)
export const clearPlayersWithCascade = mutation({
  args: {
    preserveAuth: v.optional(v.boolean()), // Keep user accounts
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = Math.min(args.batchSize || 50, 100);
    const results = {
      players: 0,
      playerStats: 0,
      tournamentResults: 0,
      userFollows: 0,
    };

    // First, get batch of player IDs
    const players = await ctx.db.query("players").take(batchSize);
    const playerIds = players.map((p) => p._id);

    // Delete related data first (to maintain referential integrity)

    // Delete tournament results
    for (const playerId of playerIds) {
      let hasMore = true;
      while (hasMore) {
        const tournamentResults = await ctx.db
          .query("tournamentResults")
          .withIndex("by_player", (q) => q.eq("playerId", playerId))
          .take(BATCH_SIZE);

        if (tournamentResults.length === 0) {
          hasMore = false;
        } else {
          for (const result of tournamentResults) {
            await ctx.db.delete(result._id);
            results.tournamentResults++;
          }
        }
      }
    }

    // Delete player stats
    for (const playerId of playerIds) {
      let hasMore = true;
      while (hasMore) {
        const stats = await ctx.db
          .query("playerStats")
          .filter((q) => q.eq(q.field("playerId"), playerId))
          .take(BATCH_SIZE);

        if (stats.length === 0) {
          hasMore = false;
        } else {
          for (const stat of stats) {
            await ctx.db.delete(stat._id);
            results.playerStats++;
          }
        }
      }
    }

    // Delete user follows (unless preserving auth)
    if (!args.preserveAuth) {
      for (const playerId of playerIds) {
        let hasMore = true;
        while (hasMore) {
          const follows = await ctx.db
            .query("userFollows")
            .filter((q) => q.eq(q.field("playerId"), playerId))
            .take(BATCH_SIZE);

          if (follows.length === 0) {
            hasMore = false;
          } else {
            for (const follow of follows) {
              await ctx.db.delete(follow._id);
              results.userFollows++;
            }
          }
        }
      }
    }

    // Finally, delete players
    for (const player of players) {
      await ctx.db.delete(player._id);
      results.players++;
    }

    return {
      success: true,
      deleted: results,
      hasMore: players.length === batchSize,
      message: `Cascade deleted: ${results.players} players, ${results.playerStats} stats, ${results.tournamentResults} results, ${results.userFollows} follows`,
    };
  },
});

// Validate database integrity (PAGINATED)
export const validateDatabase = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 200, 500); // Default 200, max 500
    const validation = {
      players: {
        total: 0,
        withRankings: 0,
        withStats: 0,
        withResults: 0,
        duplicates: [] as string[],
      },
      tournamentResults: {
        total: 0,
        withEarnings: 0,
        withScores: 0,
        orphaned: 0,
      },
      playerStats: {
        total: 0,
        orphaned: 0,
      },
      topRankings: {
        hasNumber1: false,
        top10Complete: false,
        missingRanks: [] as number[],
      },
      issues: [] as string[],
    };

    // Check players
    const players = await ctx.db.query("players").take(limit);
    validation.players.total = players.length;

    // Check for world rankings
    validation.players.withRankings = players.filter(
      (p) => p.worldRanking !== undefined && p.worldRanking !== null
    ).length;

    // Check for duplicates
    const nameCount: Record<string, number> = {};
    players.forEach((p) => {
      nameCount[p.name] = (nameCount[p.name] || 0) + 1;
    });
    validation.players.duplicates = Object.entries(nameCount)
      .filter(([_, count]) => count > 1)
      .map(([name, _]) => name);

    // Check tournament results
    const results = await ctx.db.query("tournamentResults").take(1000);
    validation.tournamentResults.total = results.length;
    validation.tournamentResults.withEarnings = results.filter(
      (r) => r.earnings !== undefined && r.earnings !== null && r.earnings > 0
    ).length;
    validation.tournamentResults.withScores = results.filter(
      (r) => r.scores !== undefined && r.scores !== null
    ).length;

    // Check for orphaned tournament results
    for (const result of results) {
      const player = await ctx.db.get(result.playerId);
      if (!player) {
        validation.tournamentResults.orphaned++;
      }
    }

    // Check player stats
    const stats = await ctx.db.query("playerStats").take(limit);
    validation.playerStats.total = stats.length;

    // Check for orphaned stats
    for (const stat of stats) {
      const player = await ctx.db.get(stat.playerId);
      if (!player) {
        validation.playerStats.orphaned++;
      }
    }

    // Check top rankings
    const rankedPlayers = players
      .filter((p) => p.worldRanking)
      .sort((a, b) => (a.worldRanking || 999) - (b.worldRanking || 999));

    validation.topRankings.hasNumber1 = rankedPlayers.some(
      (p) => p.worldRanking === 1
    );

    // Check for missing top 10 ranks
    for (let rank = 1; rank <= 10; rank++) {
      if (!rankedPlayers.some((p) => p.worldRanking === rank)) {
        validation.topRankings.missingRanks.push(rank);
      }
    }
    validation.topRankings.top10Complete =
      validation.topRankings.missingRanks.length === 0;

    // Identify issues
    if (!validation.topRankings.hasNumber1) {
      validation.issues.push("No player with world ranking #1");
    }
    if (!validation.topRankings.top10Complete) {
      validation.issues.push(
        `Missing world rankings: ${validation.topRankings.missingRanks.join(", ")}`
      );
    }
    if (validation.players.duplicates.length > 0) {
      validation.issues.push(
        `Duplicate players found: ${validation.players.duplicates.slice(0, 5).join(", ")}`
      );
    }
    if (validation.tournamentResults.orphaned > 0) {
      validation.issues.push(
        `${validation.tournamentResults.orphaned} orphaned tournament results`
      );
    }
    if (validation.playerStats.orphaned > 0) {
      validation.issues.push(
        `${validation.playerStats.orphaned} orphaned player stats`
      );
    }

    // Find who is #1 if not Scottie Scheffler
    const number1 = rankedPlayers.find((p) => p.worldRanking === 1);
    if (number1 && !number1.name.toLowerCase().includes("scheffler")) {
      validation.issues.push(
        `World #1 is ${number1.name}, not Scottie Scheffler`
      );
    }

    return validation;
  },
});

// Clean up orphaned records (BATCHED)
export const cleanupOrphans = mutation({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = Math.min(args.batchSize || 50, 100);
    const cleaned = {
      tournamentResults: 0,
      playerStats: 0,
      userFollows: 0,
    };

    // Clean orphaned tournament results
    let hasMore = true;
    while (hasMore) {
      const results = await ctx.db.query("tournamentResults").take(batchSize);
      if (results.length === 0) {
        hasMore = false;
      } else {
        for (const result of results) {
          const player = await ctx.db.get(result.playerId);
          if (!player) {
            await ctx.db.delete(result._id);
            cleaned.tournamentResults++;
          }
        }
      }
    }

    // Clean orphaned player stats
    hasMore = true;
    while (hasMore) {
      const stats = await ctx.db.query("playerStats").take(batchSize);
      if (stats.length === 0) {
        hasMore = false;
      } else {
        for (const stat of stats) {
          const player = await ctx.db.get(stat.playerId);
          if (!player) {
            await ctx.db.delete(stat._id);
            cleaned.playerStats++;
          }
        }
      }
    }

    // Clean orphaned user follows
    hasMore = true;
    while (hasMore) {
      const follows = await ctx.db.query("userFollows").take(batchSize);
      if (follows.length === 0) {
        hasMore = false;
      } else {
        for (const follow of follows) {
          const player = await ctx.db.get(follow.playerId);
          if (!player) {
            await ctx.db.delete(follow._id);
            cleaned.userFollows++;
          }
        }
      }
    }

    return {
      success: true,
      cleaned,
      message: `Cleaned ${cleaned.tournamentResults} results, ${cleaned.playerStats} stats, ${cleaned.userFollows} follows`,
    };
  },
});