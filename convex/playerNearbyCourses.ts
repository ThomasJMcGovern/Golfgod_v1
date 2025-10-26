import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Player Nearby Courses Queries and Mutations
 *
 * Manages tour courses within 180 miles of player's hometown or university.
 * Table size: ~800 records (4 avg per player) - safe for .collect() with index
 */

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all nearby courses for a player (hometown AND university)
 * Safe to .collect() - bounded by playerId (~4-8 records per player)
 */
export const getPlayerNearbyCourses = query({
  args: {
    playerId: v.id("players"),
    courseType: v.optional(v.string()), // "Hometown" or "University" - optional filter
  },
  handler: async (ctx, args) => {
    let nearbyQuery = ctx.db
      .query("playerNearbyCourses")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId));

    const nearbyCourses = await nearbyQuery.collect();

    // Filter by course type if specified
    const filtered = args.courseType
      ? nearbyCourses.filter((c) => c.courseType === args.courseType)
      : nearbyCourses;

    // Enrich with course details
    const enriched = await Promise.all(
      filtered.map(async (nearby) => {
        const course = await ctx.db.get(nearby.courseId);
        return {
          ...nearby,
          course: course || null,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get hometown courses only
 */
export const getHometownCourses = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    const nearbyCourses = await ctx.db
      .query("playerNearbyCourses")
      .withIndex("by_player_type", (q) =>
        q.eq("playerId", args.playerId).eq("courseType", "Hometown")
      )
      .collect();

    // Enrich with course details
    const enriched = await Promise.all(
      nearbyCourses.map(async (nearby) => {
        const course = await ctx.db.get(nearby.courseId);
        return {
          ...nearby,
          course: course || null,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get university courses only
 */
export const getUniversityCourses = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    const nearbyCourses = await ctx.db
      .query("playerNearbyCourses")
      .withIndex("by_player_type", (q) =>
        q.eq("playerId", args.playerId).eq("courseType", "University")
      )
      .collect();

    // Enrich with course details
    const enriched = await Promise.all(
      nearbyCourses.map(async (nearby) => {
        const course = await ctx.db.get(nearby.courseId);
        return {
          ...nearby,
          course: course || null,
        };
      })
    );

    return enriched;
  },
});

/**
 * Reverse lookup: Get all players for whom this course is nearby
 * Useful for course pages showing "local favorites"
 */
export const getPlayersForCourse = query({
  args: {
    courseId: v.id("courses"),
    courseType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const nearbyRecords = await ctx.db
      .query("playerNearbyCourses")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    // Filter by course type if specified
    const filtered = args.courseType
      ? nearbyRecords.filter((r) => r.courseType === args.courseType)
      : nearbyRecords;

    // Enrich with player details
    const enriched = await Promise.all(
      filtered.map(async (nearby) => {
        const player = await ctx.db.get(nearby.playerId);
        return {
          ...nearby,
          player: player || null,
        };
      })
    );

    return enriched;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Add a nearby course for a player
 */
export const addNearbyCourse = mutation({
  args: {
    playerId: v.id("players"),
    courseId: v.id("courses"),
    courseType: v.string(), // "Hometown" or "University"
    distanceMiles: v.number(),
    referenceLocation: v.string(),
    eventsPlayed: v.optional(v.number()),
    avgScore: v.optional(v.number()),
    bestFinish: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("playerNearbyCourses", {
      ...args,
      lastUpdated: Date.now(),
    });

    return id;
  },
});

/**
 * Update performance stats for a nearby course
 */
export const updateCoursePerformance = mutation({
  args: {
    recordId: v.id("playerNearbyCourses"),
    eventsPlayed: v.optional(v.number()),
    avgScore: v.optional(v.number()),
    bestFinish: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { recordId, ...updates } = args;

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(recordId, {
      ...cleanUpdates,
      lastUpdated: Date.now(),
    });

    return recordId;
  },
});

/**
 * Delete a nearby course record
 */
export const deleteNearbyCourse = mutation({
  args: { recordId: v.id("playerNearbyCourses") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.recordId);
    return true;
  },
});
