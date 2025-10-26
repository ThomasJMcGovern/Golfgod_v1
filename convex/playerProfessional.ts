import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Player Professional Career History Queries and Mutations
 *
 * Manages professional career timeline, status, and milestones.
 * Table size: ~200 records (one per player) - safe for .collect() with index
 */

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get professional career history for a player
 * Returns single record per player
 */
export const getPlayerProfessional = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    const professional = await ctx.db
      .query("playerProfessional")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .first();

    return professional;
  },
});

/**
 * Get all active PGA Tour and Korn Ferry Tour players
 * Safe to .collect() - small table (~200 records, indexed)
 */
export const getActivePlayers = query({
  args: {},
  handler: async (ctx) => {
    const allProfessionals = await ctx.db
      .query("playerProfessional")
      .withIndex("by_status", (q) => q.eq("currentStatus", "PGA Tour"))
      .collect();

    const kornFerry = await ctx.db
      .query("playerProfessional")
      .withIndex("by_status", (q) => q.eq("currentStatus", "Korn Ferry"))
      .collect();

    return [...allProfessionals, ...kornFerry];
  },
});

/**
 * Get all retired players
 * Safe to .collect() - small table with index
 */
export const getRetiredPlayers = query({
  args: {},
  handler: async (ctx) => {
    const retired = await ctx.db
      .query("playerProfessional")
      .withIndex("by_status", (q) => q.eq("currentStatus", "Retired"))
      .collect();

    return retired;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create or update professional career record
 * Upserts based on playerId
 */
export const upsertPlayerProfessional = mutation({
  args: {
    playerId: v.id("players"),
    currentStatus: v.string(),
    tourCard: v.optional(v.number()),
    rookieYear: v.optional(v.number()),
    careerEarnings: v.optional(v.number()),
    majorWins: v.optional(v.number()),
    totalWins: v.optional(v.number()),
    milestones: v.array(v.object({
      year: v.number(),
      achievement: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const { playerId, ...professionalData } = args;

    // Check if record already exists
    const existing = await ctx.db
      .query("playerProfessional")
      .withIndex("by_player", (q) => q.eq("playerId", playerId))
      .first();

    const timestamp = Date.now();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        ...professionalData,
        lastUpdated: timestamp,
      });
      return existing._id;
    } else {
      // Create new record
      const id = await ctx.db.insert("playerProfessional", {
        playerId,
        ...professionalData,
        lastUpdated: timestamp,
      });
      return id;
    }
  },
});

/**
 * Add a career milestone to player's record
 */
export const addMilestone = mutation({
  args: {
    playerId: v.id("players"),
    milestone: v.object({
      year: v.number(),
      achievement: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const professional = await ctx.db
      .query("playerProfessional")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .first();

    if (!professional) {
      throw new Error("Player professional record not found");
    }

    // Add milestone to array
    const updatedMilestones = [...professional.milestones, args.milestone];

    await ctx.db.patch(professional._id, {
      milestones: updatedMilestones,
      lastUpdated: Date.now(),
    });

    return professional._id;
  },
});

/**
 * Update player's current tour status
 */
export const updateStatus = mutation({
  args: {
    playerId: v.id("players"),
    newStatus: v.string(),
  },
  handler: async (ctx, args) => {
    const professional = await ctx.db
      .query("playerProfessional")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .first();

    if (!professional) {
      throw new Error("Player professional record not found");
    }

    await ctx.db.patch(professional._id, {
      currentStatus: args.newStatus,
      lastUpdated: Date.now(),
    });

    return professional._id;
  },
});
