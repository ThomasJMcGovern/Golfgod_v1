import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const findDuplicatePlayers = query({
  handler: async (ctx) => {
    const players = await ctx.db.query("players").collect();

    // Group by ESPN ID
    const byEspnId: Record<string, typeof players> = {};

    players.forEach(player => {
      if (player.espnId) {
        if (!byEspnId[player.espnId]) {
          byEspnId[player.espnId] = [];
        }
        byEspnId[player.espnId].push(player);
      }
    });

    // Find duplicates
    const duplicates = Object.entries(byEspnId)
      .filter(([_, group]) => group.length > 1)
      .map(([espnId, group]) => ({
        espnId,
        players: group.map(p => ({
          _id: p._id,
          name: p.name,
          photoUrl: p.photoUrl,
          worldRanking: p.worldRanking,
        }))
      }));

    return duplicates;
  },
});

export const fixJJSpaun = mutation({
  handler: async (ctx) => {
    // Find both entries
    const players = await ctx.db
      .query("players")
      .collect();

    const jjEntries = players.filter(p =>
      p.name.toLowerCase().includes("spaun")
    );

    const results = [];

    for (const player of jjEntries) {
      if (player.name === "J.J. Spaun" && !player.photoUrl) {
        // Update the J.J. Spaun entry with photo
        await ctx.db.patch(player._id, {
          photoUrl: "https://a.espncdn.com/i/headshots/golf/players/full/10166.png",
          espnId: "10166"
        });
        results.push(`Updated ${player.name} with photo`);
      }
    }

    return {
      message: "Fixed JJ Spaun entries",
      results,
      entries: jjEntries.map(p => ({
        _id: p._id,
        name: p.name,
        photoUrl: p.photoUrl,
        espnId: p.espnId,
      }))
    };
  },
});

export const removeDuplicatePlayer = mutation({
  args: {
    playerId: v.id("players"),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    // Check if player has any tournament results
    const results = await ctx.db
      .query("tournamentResults")
      .withIndex("by_player", q => q.eq("playerId", args.playerId))
      .take(1);

    if (results.length > 0) {
      return {
        success: false,
        message: `Cannot delete ${player.name} - has ${results.length} tournament results`
      };
    }

    await ctx.db.delete(args.playerId);

    return {
      success: true,
      message: `Deleted duplicate player: ${player.name}`
    };
  },
});