import { query } from "./_generated/server";

export const analyzePlayerCount = query({
  handler: async (ctx) => {
    const allPlayers = await ctx.db.query("players").collect();

    // Group by various fields to find potential duplicates
    const byName: Record<string, typeof allPlayers> = {};
    const byEspnId: Record<string, typeof allPlayers> = {};
    const withoutEspnId: typeof allPlayers = [];

    allPlayers.forEach(player => {
      // Group by name
      const normalizedName = player.name.toLowerCase().trim();
      if (!byName[normalizedName]) {
        byName[normalizedName] = [];
      }
      byName[normalizedName].push(player);

      // Group by ESPN ID
      if (player.espnId) {
        if (!byEspnId[player.espnId]) {
          byEspnId[player.espnId] = [];
        }
        byEspnId[player.espnId].push(player);
      } else {
        withoutEspnId.push(player);
      }
    });

    // Find duplicates by name
    const duplicatesByName = Object.entries(byName)
      .filter(([_, players]) => players.length > 1)
      .map(([name, players]) => ({
        name,
        count: players.length,
        players: players.map(p => ({
          _id: p._id,
          name: p.name,
          espnId: p.espnId,
          photoUrl: p.photoUrl,
          worldRanking: p.worldRanking
        }))
      }));

    // Find duplicates by ESPN ID
    const duplicatesByEspnId = Object.entries(byEspnId)
      .filter(([_, players]) => players.length > 1)
      .map(([espnId, players]) => ({
        espnId,
        count: players.length,
        players: players.map(p => ({
          _id: p._id,
          name: p.name,
          photoUrl: p.photoUrl,
          worldRanking: p.worldRanking
        }))
      }));

    // Find players without ESPN ID
    const playersWithoutEspnId = withoutEspnId.map(p => ({
      _id: p._id,
      name: p.name,
      worldRanking: p.worldRanking,
      photoUrl: p.photoUrl
    }));

    // Get unique players count
    const uniqueByName = Object.keys(byName).length;
    const uniqueByEspnId = Object.keys(byEspnId).length;

    return {
      totalEntries: allPlayers.length,
      uniquePlayersByName: uniqueByName,
      uniquePlayersByEspnId: uniqueByEspnId,
      playersWithoutEspnId: playersWithoutEspnId.length,
      duplicatesByName: duplicatesByName.length > 0 ? duplicatesByName : "No duplicates by name",
      duplicatesByEspnId: duplicatesByEspnId.length > 0 ? duplicatesByEspnId : "No duplicates by ESPN ID",
      playersWithoutEspnIdList: playersWithoutEspnId.slice(0, 10), // Show first 10
      summary: {
        expectedCount: 200,
        actualCount: allPlayers.length,
        difference: allPlayers.length - 200
      }
    };
  },
});