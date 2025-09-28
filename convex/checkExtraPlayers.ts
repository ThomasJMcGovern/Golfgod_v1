import { query } from "./_generated/server";

export const checkExtraPlayersWithResults = query({
  handler: async (ctx) => {
    const allPlayers = await ctx.db.query("players").collect();

    // Sort by world ranking to find who's outside top 200
    const rankedPlayers = allPlayers
      .filter(p => p.worldRanking !== null && p.worldRanking !== undefined)
      .sort((a, b) => (a.worldRanking || 999) - (b.worldRanking || 999));

    // Players ranked beyond 200
    const playersRankedBeyond200 = rankedPlayers
      .filter(p => p.worldRanking && p.worldRanking > 200)
      .map(p => ({
        name: p.name,
        worldRanking: p.worldRanking,
        espnId: p.espnId,
        _id: p._id
      }));

    // Check each player for tournament results
    const playersWithResultCheck = [];

    for (const player of allPlayers) {
      const results = await ctx.db
        .query("tournamentResults")
        .withIndex("by_player", q => q.eq("playerId", player._id))
        .collect();

      if (!player.espnId || (player.worldRanking && player.worldRanking > 200)) {
        playersWithResultCheck.push({
          _id: player._id,
          name: player.name,
          worldRanking: player.worldRanking,
          espnId: player.espnId,
          resultCount: results.length,
          hasResults: results.length > 0
        });
      }
    }

    // Separate into categories
    const noEspnIdWithResults = playersWithResultCheck.filter(p => !p.espnId && p.hasResults);
    const noEspnIdNoResults = playersWithResultCheck.filter(p => !p.espnId && !p.hasResults);
    const beyond200WithResults = playersWithResultCheck.filter(p => p.worldRanking && p.worldRanking > 200 && p.hasResults);
    const beyond200NoResults = playersWithResultCheck.filter(p => p.worldRanking && p.worldRanking > 200 && !p.hasResults);

    return {
      totalPlayers: allPlayers.length,
      playersRankedBeyond200: playersRankedBeyond200,
      analysis: {
        noEspnIdWithResults: {
          count: noEspnIdWithResults.length,
          players: noEspnIdWithResults
        },
        noEspnIdNoResults: {
          count: noEspnIdNoResults.length,
          players: noEspnIdNoResults
        },
        beyond200WithResults: {
          count: beyond200WithResults.length,
          players: beyond200WithResults
        },
        beyond200NoResults: {
          count: beyond200NoResults.length,
          players: beyond200NoResults
        }
      },
      safeToDelete: [...noEspnIdNoResults, ...beyond200NoResults]
    };
  },
});