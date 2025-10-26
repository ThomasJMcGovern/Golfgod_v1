import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Player Family Golf History Queries and Mutations
 *
 * Manages family members with college/professional golf backgrounds.
 * Table size: ~400 records (2 avg per player) - safe for .collect() with index
 */

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all family golf history records for a player
 * Safe to .collect() - bounded by playerId (~2-5 records per player)
 */
export const getPlayerFamilyHistory = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    const history = await ctx.db
      .query("playerFamilyHistory")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .collect();

    return history;
  },
});

/**
 * Get family golf history filtered by golf level
 * Useful for showing only professional family members
 */
export const getFamilyHistoryByLevel = query({
  args: {
    playerId: v.id("players"),
    golfLevel: v.string(), // "College", "Professional", "Amateur"
  },
  handler: async (ctx, args) => {
    const allHistory = await ctx.db
      .query("playerFamilyHistory")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .collect();

    // Filter by golf level in memory (small dataset)
    return allHistory.filter((h) => h.golfLevel === args.golfLevel);
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Add a family member with golf background
 */
export const addFamilyMember = mutation({
  args: {
    playerId: v.id("players"),
    memberName: v.string(),
    relationship: v.string(),
    golfLevel: v.string(),
    achievements: v.string(),
    yearsActive: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("playerFamilyHistory", {
      ...args,
      lastUpdated: Date.now(),
    });

    return id;
  },
});

/**
 * Update an existing family member record
 */
export const updateFamilyMember = mutation({
  args: {
    memberId: v.id("playerFamilyHistory"),
    memberName: v.optional(v.string()),
    relationship: v.optional(v.string()),
    golfLevel: v.optional(v.string()),
    achievements: v.optional(v.string()),
    yearsActive: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { memberId, ...updates } = args;

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(memberId, {
      ...cleanUpdates,
      lastUpdated: Date.now(),
    });

    return memberId;
  },
});

/**
 * Delete a family member record
 */
export const deleteFamilyMember = mutation({
  args: { memberId: v.id("playerFamilyHistory") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.memberId);
    return true;
  },
});
