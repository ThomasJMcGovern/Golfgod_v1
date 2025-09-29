import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,

  // Player tables
  players: defineTable({
    name: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    country: v.string(),
    countryCode: v.string(),
    birthDate: v.optional(v.string()),
    birthPlace: v.optional(v.string()),
    college: v.optional(v.string()),
    swing: v.optional(v.union(v.literal("Right"), v.literal("Left"))),
    turnedPro: v.optional(v.number()),
    height: v.optional(v.string()), // e.g., "6'1"" or "185 cm"
    weight: v.optional(v.string()), // e.g., "185 lbs" or "84 kg"
    photoUrl: v.optional(v.string()),
    worldRanking: v.optional(v.number()),
    tourRanking: v.optional(v.number()),
    espnId: v.optional(v.string()),
  })
    .index("by_name", ["name"])
    .index("by_world_ranking", ["worldRanking"])
    .searchIndex("search_name", {
      searchField: "name",
    }),

  playerStats: defineTable({
    playerId: v.id("players"),
    year: v.number(),
    avgSgApp: v.optional(v.number()),
    fairwaysHit: v.optional(v.number()),
    avgPutts: v.optional(v.number()),
    tournaments: v.optional(v.number()),
    wins: v.optional(v.number()),
    top10s: v.optional(v.number()),
    earnings: v.optional(v.number()),
  })
    .index("by_player_year", ["playerId", "year"]),

  userFollows: defineTable({
    userId: v.string(),
    playerId: v.id("players"),
    followedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_player", ["userId", "playerId"]),

  // Tournament results table - Enhanced for detailed scoring
  tournamentResults: defineTable({
    playerId: v.id("players"),
    playerName: v.string(), // Store name for reference
    year: v.number(),
    date: v.string(),
    tournament: v.string(),
    course: v.optional(v.string()), // Course name
    position: v.string(), // Can be "T1", "2", "Missed Cut", etc.
    scores: v.optional(v.array(v.string())), // Round-by-round scores ["69", "72", "71", "70"]
    totalScore: v.optional(v.number()), // Total strokes (e.g., 282)
    toPar: v.optional(v.number()), // Relative to par (e.g., -6)
    score: v.string(), // Display score e.g., "-10" or "E"
    overall: v.string(), // Display total e.g., "282"
    earnings: v.optional(v.number()), // Prize money (nullable)
  })
    .index("by_player", ["playerId"])
    .index("by_player_year", ["playerId", "year"])
    .index("by_tournament", ["tournament"])
    .index("by_year", ["year"])
    .index("by_player_name", ["playerName"]),

  // PGA Tournament Schedule table
  pgaTournaments: defineTable({
    tournament_id: v.string(),           // e.g., "2024_the_sentry"
    name: v.string(),                     // Tournament name
    year: v.number(),                     // Year (2015-2026)
    dates_raw: v.optional(v.string()),   // Original date string
    start_date: v.optional(v.string()),  // Start date
    end_date: v.optional(v.string()),    // End date
    winner_name: v.optional(v.string()), // Winner's name (for completed tournaments)
    winner_espn_id: v.optional(v.number()), // ESPN player ID (for completed tournaments)
    winner_profile_url: v.optional(v.string()), // ESPN profile URL (for completed tournaments)
    winning_score: v.optional(v.string()),      // Score (e.g., "263 (-29)")
    prize_money: v.optional(v.number()),        // Prize money in dollars
    status: v.string(),                   // "completed" or "scheduled"
    espn_tournament_id: v.optional(v.string()), // ESPN tournament ID
    espn_leaderboard_url: v.optional(v.string()), // ESPN leaderboard URL
    scraped_at: v.string(),               // ISO timestamp
    // Previous winner fields (for scheduled tournaments)
    previous_winner_name: v.optional(v.string()), // Previous winner's name
    previous_winner_espn_id: v.optional(v.number()), // Previous winner's ESPN ID
    previous_winner_profile_url: v.optional(v.string()), // Previous winner's profile URL
  })
    .index("by_year", ["year"])
    .index("by_winner", ["winner_espn_id"])
    .index("by_tournament_id", ["tournament_id"])
    .index("by_year_and_name", ["year", "name"])
    .index("by_status", ["status"]),
});