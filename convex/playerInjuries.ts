import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Player Injury History Queries and Mutations
 *
 * Manages injury tracking with status, recovery timeline, and impact.
 * Table size: ~300 records (1.5 avg per player) - safe for .collect() with index
 */

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all injuries for a player in chronological order (most recent first)
 * Safe to .collect() - bounded by playerId (~1-3 records per player)
 */
export const getPlayerInjuries = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    const injuries = await ctx.db
      .query("playerInjuries")
      .withIndex("by_player_date", (q) => q.eq("playerId", args.playerId))
      .collect();

    // Sort by injury date descending (most recent first)
    return injuries.sort((a, b) => b.injuryDate.localeCompare(a.injuryDate));
  },
});

/**
 * Get active and recovering injuries only
 * Excludes fully recovered injuries
 */
export const getActiveInjuries = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    const allInjuries = await ctx.db
      .query("playerInjuries")
      .withIndex("by_player_date", (q) => q.eq("playerId", args.playerId))
      .collect();

    // Filter for Active or Recovering status
    const active = allInjuries.filter(
      (injury) => injury.status === "Active" || injury.status === "Recovering"
    );

    return active.sort((a, b) => b.injuryDate.localeCompare(a.injuryDate));
  },
});

/**
 * Get injury history (recovered injuries only)
 * Useful for showing past injuries that are fully healed
 */
export const getInjuryHistory = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    const allInjuries = await ctx.db
      .query("playerInjuries")
      .withIndex("by_player_date", (q) => q.eq("playerId", args.playerId))
      .collect();

    // Filter for Recovered status only
    const history = allInjuries.filter(
      (injury) => injury.status === "Recovered"
    );

    return history.sort((a, b) => b.injuryDate.localeCompare(a.injuryDate));
  },
});

/**
 * Get all injuries by status (global view)
 * Useful for admin dashboard showing all active injuries across all players
 */
export const getInjuriesByStatus = query({
  args: { status: v.string() }, // "Active", "Recovering", "Recovered"
  handler: async (ctx, args) => {
    const injuries = await ctx.db
      .query("playerInjuries")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();

    // Enrich with player details
    const enriched = await Promise.all(
      injuries.map(async (injury) => {
        const player = await ctx.db.get(injury.playerId);
        return {
          ...injury,
          player: player || null,
        };
      })
    );

    return enriched.sort((a, b) => b.injuryDate.localeCompare(a.injuryDate));
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Add a new injury record
 */
export const addInjury = mutation({
  args: {
    playerId: v.id("players"),
    injuryType: v.string(),
    affectedArea: v.string(),
    injuryDate: v.string(), // ISO date (YYYY-MM-DD)
    status: v.string(), // "Active", "Recovering", "Recovered"
    recoveryTimeline: v.optional(v.string()),
    tournamentsMissed: v.optional(v.number()),
    impact: v.optional(v.string()),
    returnDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("playerInjuries", {
      ...args,
      lastUpdated: Date.now(),
    });

    return id;
  },
});

/**
 * Update injury status and return date
 * Typically used to mark injury as "Recovering" or "Recovered"
 */
export const updateInjuryStatus = mutation({
  args: {
    injuryId: v.id("playerInjuries"),
    status: v.string(),
    returnDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { injuryId, ...updates } = args;

    await ctx.db.patch(injuryId, {
      ...updates,
      lastUpdated: Date.now(),
    });

    return injuryId;
  },
});

/**
 * Delete an injury record
 */
export const deleteInjury = mutation({
  args: { injuryId: v.id("playerInjuries") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.injuryId);
    return true;
  },
});
