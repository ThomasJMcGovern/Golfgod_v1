import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const updatePlayerBiosBatch = mutation({
  args: {
    players: v.array(v.object({
      espnId: v.string(),
      playerName: v.string(),
      country: v.optional(v.string()),
      birthDate: v.optional(v.string()),
      birthPlace: v.optional(v.string()),
      college: v.optional(v.string()),
      height: v.optional(v.string()),
      weight: v.optional(v.string()),
      turnedPro: v.optional(v.number()),
      swing: v.optional(v.union(v.literal("Right"), v.literal("Left"))),
    })),
  },
  handler: async (ctx, args) => {
    const results = {
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const playerData of args.players) {
      try {
        // First try to find by ESPN ID
        let player = await ctx.db
          .query("players")
          .filter((q) => q.eq(q.field("espnId"), playerData.espnId))
          .first();

        // If not found by ESPN ID, try by name as fallback
        if (!player && playerData.playerName) {
          // Try exact match first
          player = await ctx.db
            .query("players")
            .withIndex("by_name", (q) => q.eq("name", playerData.playerName))
            .first();

          // If still not found, try case-insensitive match
          if (!player) {
            const allPlayers = await ctx.db.query("players").collect();
            player = allPlayers.find(
              p => p.name.toLowerCase() === playerData.playerName.toLowerCase()
            ) || null;
          }
        }

        if (!player) {
          results.errors.push(`Player not found: ${playerData.playerName} (ESPN ID: ${playerData.espnId})`);
          results.skipped++;
          continue;
        }

        // Build update object with only non-empty values
        const updateData: any = {};

        if (playerData.birthDate && playerData.birthDate.trim()) {
          updateData.birthDate = playerData.birthDate;
        }
        if (playerData.birthPlace && playerData.birthPlace.trim()) {
          updateData.birthPlace = playerData.birthPlace;
        }
        if (playerData.college && playerData.college.trim()) {
          updateData.college = playerData.college;
        }
        if (playerData.height && playerData.height.trim()) {
          updateData.height = playerData.height;
        }
        if (playerData.weight && playerData.weight.trim()) {
          updateData.weight = playerData.weight;
        }
        if (playerData.turnedPro && playerData.turnedPro > 0) {
          updateData.turnedPro = playerData.turnedPro;
        }
        if (playerData.swing && (playerData.swing === "Right" || playerData.swing === "Left")) {
          updateData.swing = playerData.swing;
        }
        if (playerData.country && playerData.country.trim()) {
          // Update country if it's empty or "Unknown" in the database
          if (!player.country || player.country === "Unknown" || player.country === "") {
            updateData.country = playerData.country;
          }
        }

        // Only update if there are fields to update
        if (Object.keys(updateData).length > 0) {
          await ctx.db.patch(player._id, updateData);
          results.updated++;
        } else {
          results.skipped++;
        }
      } catch (error) {
        results.errors.push(`Error updating ${playerData.playerName}: ${error}`);
        results.skipped++;
      }
    }

    return results;
  },
});

// Query to check bio completeness
export const checkBioCompleteness = mutation({
  handler: async (ctx) => {
    const players = await ctx.db.query("players").collect();

    const stats = {
      total: players.length,
      withBirthDate: 0,
      withBirthPlace: 0,
      withCollege: 0,
      withHeight: 0,
      withWeight: 0,
      withTurnedPro: 0,
      withSwing: 0,
      complete: 0,
      incomplete: [] as string[],
    };

    for (const player of players) {
      let isComplete = true;

      if (player.birthDate) stats.withBirthDate++;
      else isComplete = false;

      if (player.birthPlace) stats.withBirthPlace++;
      else isComplete = false;

      if (player.college) stats.withCollege++;
      // College is optional, so don't mark as incomplete

      if (player.height) stats.withHeight++;
      else isComplete = false;

      if (player.weight) stats.withWeight++;
      else isComplete = false;

      if (player.turnedPro) stats.withTurnedPro++;
      else isComplete = false;

      if (player.swing) stats.withSwing++;
      else isComplete = false;

      if (isComplete) {
        stats.complete++;
      } else {
        stats.incomplete.push(player.name);
      }
    }

    return stats;
  },
});