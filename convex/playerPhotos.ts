import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Mutation to update a single player with photo data
export const updatePlayerPhoto = mutation({
  args: {
    playerName: v.string(),
    espnId: v.string(),
    photoUrl: v.string(),
    worldRank: v.number(),
  },
  handler: async (ctx, args) => {
    // Normalize the name for matching (handle case variations)
    const normalizedInputName = args.playerName.toLowerCase().trim();

    // Try to find player by name
    const players = await ctx.db
      .query("players")
      .collect();

    // Find matching player (case-insensitive)
    const matchingPlayer = players.find(p =>
      p.name.toLowerCase() === normalizedInputName ||
      p.name.toLowerCase().replace(/\s+/g, " ") === normalizedInputName.replace(/\s+/g, " ")
    );

    if (matchingPlayer) {
      // Update existing player
      await ctx.db.patch(matchingPlayer._id, {
        espnId: args.espnId,
        photoUrl: args.photoUrl,
        worldRanking: args.worldRank,
      });

      return {
        success: true,
        action: "updated",
        playerId: matchingPlayer._id,
        playerName: matchingPlayer.name,
      };
    } else {
      // Create new player if not exists
      const nameParts = args.playerName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const newPlayerId = await ctx.db.insert("players", {
        name: args.playerName.trim(),
        firstName,
        lastName,
        country: "United States", // Default, can be updated later
        countryCode: "US",
        espnId: args.espnId,
        photoUrl: args.photoUrl,
        worldRanking: args.worldRank,
      });

      return {
        success: true,
        action: "created",
        playerId: newPlayerId,
        playerName: args.playerName,
      };
    }
  },
});

// Batch mutation to update multiple players at once
export const updatePlayerPhotosBatch = mutation({
  args: {
    players: v.array(v.object({
      playerName: v.string(),
      espnId: v.string(),
      photoUrl: v.string(),
      worldRank: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const results = [];
    const errors = [];

    // Get all existing players for efficient matching
    const existingPlayers = await ctx.db
      .query("players")
      .collect();

    // Create a map for faster lookups
    const playerMap = new Map<string, typeof existingPlayers[0]>();
    existingPlayers.forEach(player => {
      playerMap.set(player.name.toLowerCase(), player);
    });

    for (const playerData of args.players) {
      try {
        const normalizedInputName = playerData.playerName.toLowerCase().trim();
        const existingPlayer = playerMap.get(normalizedInputName) ||
          Array.from(playerMap.values()).find(p =>
            p.name.toLowerCase().replace(/\s+/g, " ") === normalizedInputName.replace(/\s+/g, " ")
          );

        if (existingPlayer) {
          // Update existing player
          await ctx.db.patch(existingPlayer._id, {
            espnId: playerData.espnId,
            photoUrl: playerData.photoUrl,
            worldRanking: playerData.worldRank,
          });

          results.push({
            success: true,
            action: "updated",
            playerName: existingPlayer.name,
            espnId: playerData.espnId,
          });
        } else {
          // Create new player
          const nameParts = playerData.playerName.trim().split(/\s+/);
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          await ctx.db.insert("players", {
            name: playerData.playerName.trim(),
            firstName,
            lastName,
            country: "United States",
            countryCode: "US",
            espnId: playerData.espnId,
            photoUrl: playerData.photoUrl,
            worldRanking: playerData.worldRank,
          });

          results.push({
            success: true,
            action: "created",
            playerName: playerData.playerName,
            espnId: playerData.espnId,
          });
        }
      } catch (error) {
        errors.push({
          playerName: playerData.playerName,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      processed: results.length,
      updated: results.filter(r => r.action === "updated").length,
      created: results.filter(r => r.action === "created").length,
      errors: errors.length,
      results,
      errorDetails: errors,
    };
  },
});

// Query to check the status of player photos
export const getPhotoUpdateStatus = query({
  handler: async (ctx) => {
    const players = await ctx.db.query("players").collect();

    const withPhotos = players.filter(p => p.photoUrl && p.photoUrl.length > 0);
    const withEspnId = players.filter(p => p.espnId && p.espnId.length > 0);
    const withWorldRanking = players.filter(p => p.worldRanking !== undefined && p.worldRanking !== null);

    return {
      totalPlayers: players.length,
      playersWithPhotos: withPhotos.length,
      playersWithEspnId: withEspnId.length,
      playersWithWorldRanking: withWorldRanking.length,
      missingPhotos: players.length - withPhotos.length,
      missingEspnId: players.length - withEspnId.length,
      missingWorldRanking: players.length - withWorldRanking.length,
    };
  },
});