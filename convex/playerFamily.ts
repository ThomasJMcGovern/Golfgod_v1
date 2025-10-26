import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Player Family Information Queries and Mutations
 *
 * Manages personal family data for players (marital status, spouse, children).
 * Table size: ~200 records (one per player, optional) - safe for .collect() with index
 */

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get family information for a specific player
 * Returns null if no family data exists for this player
 */
export const getPlayerFamily = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    const family = await ctx.db
      .query("playerFamily")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .first();

    return family;
  },
});

/**
 * Check if player has family data
 * Useful for conditional rendering in UI
 */
export const hasFamily = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    const family = await ctx.db
      .query("playerFamily")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .first();

    return family !== null;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create or update family information for a player
 * Upserts based on playerId - creates if doesn't exist, updates if it does
 */
export const upsertPlayerFamily = mutation({
  args: {
    playerId: v.id("players"),
    maritalStatus: v.string(),
    spouseName: v.optional(v.string()),
    spouseMarriedSince: v.optional(v.number()),
    children: v.optional(v.array(v.object({
      name: v.string(),
      birthYear: v.number(),
    }))),
  },
  handler: async (ctx, args) => {
    const { playerId, ...familyData } = args;

    // Check if family record already exists
    const existing = await ctx.db
      .query("playerFamily")
      .withIndex("by_player", (q) => q.eq("playerId", playerId))
      .first();

    const timestamp = Date.now();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        ...familyData,
        lastUpdated: timestamp,
      });
      return existing._id;
    } else {
      // Create new record
      const id = await ctx.db.insert("playerFamily", {
        playerId,
        ...familyData,
        lastUpdated: timestamp,
      });
      return id;
    }
  },
});

/**
 * Delete family data for a player
 * Returns true if deleted, false if no data existed
 */
export const deletePlayerFamily = mutation({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    const family = await ctx.db
      .query("playerFamily")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .first();

    if (family) {
      await ctx.db.delete(family._id);
      return true;
    }

    return false;
  },
});
