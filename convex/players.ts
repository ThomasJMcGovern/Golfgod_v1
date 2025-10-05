import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all players for dropdown selection (PAGINATED)
export const getAllPlayers = query({
  args: {
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 100, 500); // Default 100, max 500

    if (args.search) {
      // Use search index for text search
      const results = await ctx.db
        .query("players")
        .withSearchIndex("search_name", (q) =>
          q.search("name", args.search!)
        )
        .take(limit);
      return results;
    }

    // Return paginated players sorted by name
    const players = await ctx.db
      .query("players")
      .withIndex("by_name")
      .take(limit);

    return players;
  },
});

// Simplified getAll function for components that don't need search
// EXCEPTION: Using .collect() here is SAFE because:
// - Players table has ~200 records (small, bounded dataset)
// - Using indexed query (.withIndex) makes it efficient
// - Dropdowns need ALL players for client-side search/filter to work
// - ~200 records ≈ 50KB bandwidth (negligible vs 1GB limit)
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db
      .query("players")
      .withIndex("by_name")
      .collect(); // Safe for small tables with indexes
    return players;
  },
});

// Get all player names and IDs for linking (PAGINATED)
export const getAllPlayerNamesAndIds = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 200, 1000); // Default 200, max 1000

    const players = await ctx.db
      .query("players")
      .withIndex("by_name")
      .take(limit);

    return players.map(player => ({
      _id: player._id,
      name: player.name,
      espnId: player.espnId,
    }));
  },
});

// Get single player details by ID
export const getPlayer = query({
  args: {
    playerId: v.id("players"),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    return player;
  },
});

// Get player statistics for a specific year
export const getPlayerStats = query({
  args: {
    playerId: v.id("players"),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("playerStats")
      .withIndex("by_player_year", (q) =>
        q.eq("playerId", args.playerId).eq("year", args.year)
      )
      .first();

    return stats;
  },
});

// Get world rankings (top 200)
export const getWorldRankings = query({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db
      .query("players")
      .withIndex("by_world_ranking")
      .filter((q) => q.neq(q.field("worldRanking"), undefined))
      .take(200);

    return players;
  },
});

// Get user's followed players
export const getUserFollows = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const follows = await ctx.db
      .query("userFollows")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get player details for each follow
    const playersPromises = follows.map((f) => ctx.db.get(f.playerId));
    const players = await Promise.all(playersPromises);

    return players.filter(p => p !== null);
  },
});

// Check if user follows a specific player
export const isFollowingPlayer = query({
  args: {
    playerId: v.id("players"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const follow = await ctx.db
      .query("userFollows")
      .withIndex("by_user_player", (q) =>
        q.eq("userId", userId).eq("playerId", args.playerId)
      )
      .first();

    return !!follow;
  },
});

// Follow a player
export const followPlayer = mutation({
  args: {
    playerId: v.id("players"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to follow players");
    }

    // Check if already following
    const existing = await ctx.db
      .query("userFollows")
      .withIndex("by_user_player", (q) =>
        q.eq("userId", userId).eq("playerId", args.playerId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    // Create new follow
    const followId = await ctx.db.insert("userFollows", {
      userId,
      playerId: args.playerId,
      followedAt: Date.now(),
    });

    return followId;
  },
});

// Unfollow a player
export const unfollowPlayer = mutation({
  args: {
    playerId: v.id("players"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to unfollow players");
    }

    const follow = await ctx.db
      .query("userFollows")
      .withIndex("by_user_player", (q) =>
        q.eq("userId", userId).eq("playerId", args.playerId)
      )
      .first();

    if (follow) {
      await ctx.db.delete(follow._id);
      return true;
    }

    return false;
  },
});

// Update player bio information
export const updatePlayerBio = mutation({
  args: {
    playerId: v.id("players"),
    birthDate: v.optional(v.string()),
    birthPlace: v.optional(v.string()),
    college: v.optional(v.string()),
    swing: v.optional(v.union(v.literal("Right"), v.literal("Left"))),
    turnedPro: v.optional(v.number()),
    height: v.optional(v.string()),
    weight: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { playerId, ...updateData } = args;

    // Remove undefined values
    const cleanUpdateData: any = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        cleanUpdateData[key] = value;
      }
    }

    await ctx.db.patch(playerId, cleanUpdateData);
    return { success: true };
  },
});

// Clean up placeholder data for all players
export const cleanupPlayerData = mutation({
  handler: async (ctx) => {
    const players = await ctx.db.query("players").collect();
    let updated = 0;

    for (const player of players) {
      const updates: any = {};

      // Remove "Unknown" country
      if (player.country === "Unknown") {
        updates.country = "";
      }

      // Remove placeholder "N/A" values
      if (player.college === "N/A") {
        updates.college = undefined;
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(player._id, updates);
        updated++;
      }
    }

    return { playersUpdated: updated };
  },
});

// Find players with incomplete data (OPTIMIZED - Paginated)
export const findOrphanPlayers = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 100, 500); // Default 100, max 500
    const allPlayers = await ctx.db.query("players").take(limit);

    // Get tournament result counts for each player
    const playersWithData = await Promise.all(
      allPlayers.map(async (player) => {
        // Just check if player has ANY results (don't count all)
        const hasResults = await ctx.db
          .query("tournamentResults")
          .withIndex("by_player", (q) => q.eq("playerId", player._id))
          .first();

        return {
          _id: player._id,
          name: player.name,
          espnId: player.espnId,
          country: player.country,
          countryCode: player.countryCode,
          birthDate: player.birthDate,
          hasResults: !!hasResults,
          isOrphan: !player.espnId || player.country === "Unknown" || !hasResults,
        };
      })
    );

    // Sort orphans first, then by name
    return playersWithData.sort((a, b) => {
      if (a.isOrphan !== b.isOrphan) return a.isOrphan ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  },
});

// Delete orphan players (OPTIMIZED - Batched)
export const deleteOrphanPlayers = mutation({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = Math.min(args.batchSize || 50, 100);
    const allPlayers = await ctx.db.query("players").take(batchSize);
    let deleted = 0;

    for (const player of allPlayers) {
      // Check if player has any tournament results (just check first one)
      const hasResults = await ctx.db
        .query("tournamentResults")
        .withIndex("by_player", (q) => q.eq("playerId", player._id))
        .first();

      // Delete if no results and either no espnId or country is "Unknown"
      if (!hasResults && (!player.espnId || player.country === "Unknown")) {
        await ctx.db.delete(player._id);
        deleted++;
      }
    }

    return {
      deleted,
      message: `Deleted ${deleted} orphan players (processed ${batchSize} players)`,
      hasMore: allPlayers.length === batchSize,
    };
  },
});