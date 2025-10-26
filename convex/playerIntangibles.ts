import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Player Intangibles Queries and Mutations
 *
 * Manages intangible performance factors (weather, course type, pressure).
 * Table size: ~600 records (3 avg per player) - safe for .collect() with index
 */

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all intangibles for a player
 * Safe to .collect() - bounded by playerId (~3-6 records per player)
 */
export const getPlayerIntangibles = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    const intangibles = await ctx.db
      .query("playerIntangibles")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .collect();

    // Group by category for organized display
    const grouped = intangibles.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, typeof intangibles>);

    return {
      all: intangibles,
      byCategory: grouped,
    };
  },
});

/**
 * Get intangibles filtered by category
 */
export const getIntangiblesByCategory = query({
  args: {
    playerId: v.id("players"),
    category: v.string(), // "Weather", "Course Type", "Pressure", etc.
  },
  handler: async (ctx, args) => {
    const intangibles = await ctx.db
      .query("playerIntangibles")
      .withIndex("by_player_category", (q) =>
        q.eq("playerId", args.playerId).eq("category", args.category)
      )
      .collect();

    return intangibles;
  },
});

/**
 * Shortcut: Get weather preferences for a player
 */
export const getWeatherPreferences = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    const weather = await ctx.db
      .query("playerIntangibles")
      .withIndex("by_player_category", (q) =>
        q.eq("playerId", args.playerId).eq("category", "Weather")
      )
      .collect();

    return weather;
  },
});

/**
 * Shortcut: Get course type preferences for a player
 */
export const getCourseTypePreferences = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    const courseTypes = await ctx.db
      .query("playerIntangibles")
      .withIndex("by_player_category", (q) =>
        q.eq("playerId", args.playerId).eq("category", "Course Type")
      )
      .collect();

    return courseTypes;
  },
});

/**
 * Shortcut: Get pressure performance for a player
 */
export const getPressurePerformance = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    const pressure = await ctx.db
      .query("playerIntangibles")
      .withIndex("by_player_category", (q) =>
        q.eq("playerId", args.playerId).eq("category", "Pressure")
      )
      .collect();

    return pressure;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Add a new intangible factor
 */
export const addIntangible = mutation({
  args: {
    playerId: v.id("players"),
    category: v.string(),
    subcategory: v.optional(v.string()),
    description: v.string(),
    performanceRating: v.string(), // "Outstanding", "Excellent", "Strong", "Average", "Weak", "Poor"
    supportingStats: v.optional(v.string()),
    confidence: v.optional(v.string()), // "High", "Medium", "Low"
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("playerIntangibles", {
      ...args,
      lastUpdated: Date.now(),
    });

    return id;
  },
});

/**
 * Update an existing intangible factor
 */
export const updateIntangible = mutation({
  args: {
    intangibleId: v.id("playerIntangibles"),
    category: v.optional(v.string()),
    subcategory: v.optional(v.string()),
    description: v.optional(v.string()),
    performanceRating: v.optional(v.string()),
    supportingStats: v.optional(v.string()),
    confidence: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { intangibleId, ...updates } = args;

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(intangibleId, {
      ...cleanUpdates,
      lastUpdated: Date.now(),
    });

    return intangibleId;
  },
});

/**
 * Delete an intangible factor
 */
export const deleteIntangible = mutation({
  args: { intangibleId: v.id("playerIntangibles") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.intangibleId);
    return true;
  },
});
