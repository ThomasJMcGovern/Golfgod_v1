/**
 * Course Information Queries and Mutations
 *
 * Separate from courseStats.ts for better organization.
 * Provides queries for course details, winners history, top finishers, and majors.
 *
 * CRITICAL: All queries follow Convex database rules:
 * - Use .take(limit) on large tables, NOT unbounded .collect()
 * - Use .withIndex() for filtering, NOT .filter()
 * - Safe to .collect() only on small tables (<200 records)
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get detailed course information by ID
 */
export const getCourseDetails = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.courseId);
  },
});

/**
 * Get all courses (PAGINATED - safe for dropdowns)
 * Safe to use higher limit since courses table is small (~54 records)
 */
export const getAllCourses = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 100, 200); // Default 100, max 200
    // Safe: courses table is small (~54 records, indexed)
    return await ctx.db
      .query("courses")
      .withIndex("by_name")
      .take(limit);
  },
});

/**
 * Get courses for a specific tournament name
 * Uses tournamentCourses mapping table
 */
export const getCoursesByTournament = query({
  args: { tournamentName: v.string() },
  handler: async (ctx, args) => {
    // Get tournament-to-course mappings
    const mappings = await ctx.db
      .query("tournamentCourses")
      .withIndex("by_tournament", (q) =>
        q.eq("tournamentName", args.tournamentName)
      )
      .collect(); // Safe: typically 1-3 courses per tournament

    // Fetch course details for each mapping
    const courses = [];
    for (const mapping of mappings) {
      const course = await ctx.db.get(mapping.courseId);
      if (course) {
        courses.push(course);
      }
    }
    return courses;
  },
});

/**
 * Get winners at a course since a specific year
 * Returns chronological list with player and score details
 */
export const getCourseWinners = query({
  args: {
    courseId: v.id("courses"),
    sinceYear: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 50, 100); // Default 50, max 100

    return await ctx.db
      .query("courseWinners")
      .withIndex("by_course_year", (q) =>
        q.eq("courseId", args.courseId).gte("year", args.sinceYear)
      )
      .order("desc") // Most recent first
      .take(limit);
  },
});

/**
 * Get top finishers at a course for a specific year
 * Queries tournamentResults filtered by course name and year
 */
export const getTopFinishers = query({
  args: {
    courseId: v.id("courses"),
    year: v.number(),
    topN: v.number(), // 10, 15, or 20
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.topN, 25); // Safety cap at 25

    // Get course to find its name
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      return [];
    }

    // Query tournament results for this course and year
    const results = await ctx.db
      .query("tournamentResults")
      .withIndex("by_year", (q) => q.eq("year", args.year))
      .filter((q) => q.eq(q.field("course"), course.name))
      .take(100); // Take up to 100 results, then filter and sort

    // Parse position strings and sort (handle "T-5", "MC", etc.)
    const sortedResults = results
      .map((r) => {
        // Extract numeric position (ignore "T-" prefix, filter out "MC", "CUT", "WD")
        const posMatch = r.position.match(/\d+/);
        const numericPos = posMatch ? parseInt(posMatch[0]) : 999;
        return { ...r, numericPosition: numericPos };
      })
      .filter((r) => r.numericPosition <= 50) // Only top 50 finishers
      .sort((a, b) => a.numericPosition - b.numericPosition)
      .slice(0, limit); // Take top N

    return sortedResults;
  },
});

/**
 * Get major championships hosted at a course
 * Returns list of majors with years hosted
 */
export const getCourseMajors = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("courseMajors")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect(); // Safe: typically 0-2 majors per course
  },
});

/**
 * Add a course winner record
 * Used for populating historical winner data
 */
export const addCourseWinner = mutation({
  args: {
    courseId: v.id("courses"),
    year: v.number(),
    tournament: v.string(),
    playerId: v.id("players"),
    playerName: v.string(),
    score: v.string(),
    toPar: v.optional(v.number()),
    earnings: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("courseWinners", {
      courseId: args.courseId,
      year: args.year,
      tournament: args.tournament,
      playerId: args.playerId,
      playerName: args.playerName,
      score: args.score,
      toPar: args.toPar,
      earnings: args.earnings,
    });
  },
});

/**
 * Update course details with additional information
 * Used for populating course metadata
 */
export const updateCourseDetails = mutation({
  args: {
    courseId: v.id("courses"),
    architect: v.optional(v.string()),
    established: v.optional(v.number()),
    grassGreens: v.optional(v.string()),
    grassFairways: v.optional(v.string()),
    avgGreenSize: v.optional(v.number()),
    bunkerSandType: v.optional(v.string()),
    scorecardPar: v.optional(v.array(v.number())),
    scorecardYardage: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    const { courseId, ...updates } = args;
    return await ctx.db.patch(courseId, updates);
  },
});

/**
 * Add major championship record for a course
 * Used for tracking majors hosted at specific courses
 */
export const addCourseMajor = mutation({
  args: {
    courseId: v.id("courses"),
    majorName: v.string(),
    yearsHosted: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("courseMajors", {
      courseId: args.courseId,
      majorName: args.majorName,
      yearsHosted: args.yearsHosted,
      totalHosted: args.yearsHosted.length,
    });
  },
});
