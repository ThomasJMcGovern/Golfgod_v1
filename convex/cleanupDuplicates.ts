import { mutation, query } from "./_generated/server";

export const checkDuplicatesWithResults = query({
  handler: async (ctx) => {
    // Find all duplicates
    const players = await ctx.db.query("players").collect();
    const byEspnId: Record<string, typeof players> = {};

    players.forEach(player => {
      if (player.espnId) {
        if (!byEspnId[player.espnId]) {
          byEspnId[player.espnId] = [];
        }
        byEspnId[player.espnId].push(player);
      }
    });

    // Find duplicates and check for tournament results
    const duplicates = [];

    for (const [espnId, group] of Object.entries(byEspnId)) {
      if (group.length > 1) {
        const playersWithResults = [];

        for (const player of group) {
          const results = await ctx.db
            .query("tournamentResults")
            .withIndex("by_player", q => q.eq("playerId", player._id))
            .take(1);

          playersWithResults.push({
            _id: player._id,
            name: player.name,
            photoUrl: player.photoUrl,
            hasResults: results.length > 0,
            resultCount: results.length
          });
        }

        duplicates.push({
          espnId,
          players: playersWithResults
        });
      }
    }

    return duplicates;
  },
});

export const removeDuplicatesWithoutResults = mutation({
  handler: async (ctx) => {
    const players = await ctx.db.query("players").collect();
    const byEspnId: Record<string, typeof players> = {};

    players.forEach(player => {
      if (player.espnId) {
        if (!byEspnId[player.espnId]) {
          byEspnId[player.espnId] = [];
        }
        byEspnId[player.espnId].push(player);
      }
    });

    const deleted = [];
    const kept = [];

    for (const [espnId, group] of Object.entries(byEspnId)) {
      if (group.length > 1) {
        // For each duplicate group, find which ones have results
        const playersWithResultCheck = [];

        for (const player of group) {
          const results = await ctx.db
            .query("tournamentResults")
            .withIndex("by_player", q => q.eq("playerId", player._id))
            .collect();

          playersWithResultCheck.push({
            player,
            hasResults: results.length > 0,
            resultCount: results.length
          });
        }

        // Sort by result count (keep the one with most results)
        playersWithResultCheck.sort((a, b) => b.resultCount - a.resultCount);

        // Keep the first one (most results), delete the rest if they have no results
        for (let i = 0; i < playersWithResultCheck.length; i++) {
          if (i === 0) {
            kept.push({
              name: playersWithResultCheck[i].player.name,
              espnId: playersWithResultCheck[i].player.espnId,
              resultCount: playersWithResultCheck[i].resultCount
            });
          } else if (playersWithResultCheck[i].resultCount === 0) {
            // Delete duplicates with no results
            await ctx.db.delete(playersWithResultCheck[i].player._id);
            deleted.push({
              name: playersWithResultCheck[i].player.name,
              espnId: playersWithResultCheck[i].player.espnId
            });
          } else {
            kept.push({
              name: playersWithResultCheck[i].player.name,
              espnId: playersWithResultCheck[i].player.espnId,
              resultCount: playersWithResultCheck[i].resultCount,
              note: "Has results, kept as duplicate"
            });
          }
        }
      }
    }

    return {
      message: "Cleaned up duplicate players",
      deleted: deleted,
      deletedCount: deleted.length,
      kept: kept
    };
  },
});