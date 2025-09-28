import { query } from "./_generated/server";
import { v } from "convex/values";

export const findPlayerByName = query({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Search for player by name (case insensitive)
    const players = await ctx.db
      .query("players")
      .collect();

    const matchingPlayers = players.filter(p =>
      p.name.toLowerCase().includes(args.name.toLowerCase())
    );

    return matchingPlayers.map(player => ({
      name: player.name,
      espnId: player.espnId,
      photoUrl: player.photoUrl,
      worldRanking: player.worldRanking,
      _id: player._id,
    }));
  },
});