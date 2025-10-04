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

  // Golf Courses table
  courses: defineTable({
    name: v.string(),                        // Course name (e.g., "TPC Sawgrass")
    location: v.string(),                    // City, State/Country
    par: v.number(),                         // Course par (e.g., 72)
    yardage: v.optional(v.number()),        // Total yardage
    established: v.optional(v.number()),     // Year established
    designer: v.optional(v.string()),        // Course designer
    type: v.optional(v.string()),           // Course type (links, parkland, etc.)
    grassType: v.optional(v.string()),      // Grass type (bentgrass, bermuda, etc.)
    stimpmeter: v.optional(v.number()),     // Green speed average
  })
    .index("by_name", ["name"]),

  // Tournament-Course mapping table
  tournamentCourses: defineTable({
    tournamentName: v.string(),             // Tournament name (consistent across years)
    courseId: v.id("courses"),              // Reference to courses table
    yearStart: v.number(),                  // First year at this course
    yearEnd: v.optional(v.number()),        // Last year at this course (null = current)
    isPrimary: v.boolean(),                 // Primary course for rotation tournaments
  })
    .index("by_tournament", ["tournamentName"])
    .index("by_course", ["courseId"])
    .index("by_tournament_year", ["tournamentName", "yearStart"]),

  // Player Course Statistics (aggregated/cached data)
  playerCourseStats: defineTable({
    playerId: v.id("players"),
    courseId: v.id("courses"),
    // Basic stats
    roundsPlayed: v.number(),
    scoringAverage: v.number(),
    bestScore: v.number(),
    worstScore: v.number(),
    cutsPlayed: v.number(),
    cutsMade: v.number(),
    wins: v.number(),
    top10s: v.number(),
    top25s: v.number(),
    totalEarnings: v.number(),
    // Scoring breakdown
    avgR1Score: v.optional(v.number()),
    avgR2Score: v.optional(v.number()),
    avgR3Score: v.optional(v.number()),
    avgR4Score: v.optional(v.number()),
    avgEarlyScore: v.optional(v.number()),    // R1+R2 average
    avgWeekendScore: v.optional(v.number()),  // R3+R4 average
    // Advanced stats (when available)
    avgDrivingDistance: v.optional(v.number()),
    avgDrivingAccuracy: v.optional(v.number()),
    avgGIR: v.optional(v.number()),           // Greens in Regulation
    avgPuttsPerRound: v.optional(v.number()),
    avgScrambling: v.optional(v.number()),
    avgSandSaves: v.optional(v.number()),
    // Strokes Gained (when available)
    avgSgTotal: v.optional(v.number()),
    avgSgOtt: v.optional(v.number()),         // Off the tee
    avgSgApp: v.optional(v.number()),         // Approach
    avgSgArg: v.optional(v.number()),         // Around the green
    avgSgPutt: v.optional(v.number()),        // Putting
    // Metadata
    lastUpdated: v.number(),                  // Timestamp of last calculation
    lastTournamentYear: v.number(),           // Most recent tournament year
  })
    .index("by_player", ["playerId"])
    .index("by_course", ["courseId"])
    .index("by_player_course", ["playerId", "courseId"]),

  // Detailed Round Statistics (for future detailed imports)
  roundStats: defineTable({
    playerId: v.id("players"),
    courseId: v.id("courses"),
    tournamentResultId: v.id("tournamentResults"),
    year: v.number(),
    round: v.number(),                        // 1, 2, 3, or 4
    score: v.number(),
    toPar: v.number(),
    teeTime: v.optional(v.string()),         // "AM" or "PM"
    // Detailed stats (when available)
    fairwaysHit: v.optional(v.number()),
    fairwaysPossible: v.optional(v.number()),
    greensHit: v.optional(v.number()),
    greensPossible: v.optional(v.number()),
    putts: v.optional(v.number()),
    scrambling: v.optional(v.string()),      // e.g., "3/5"
    sandSaves: v.optional(v.string()),       // e.g., "2/3"
    birdies: v.optional(v.number()),
    pars: v.optional(v.number()),
    bogeys: v.optional(v.number()),
    doubleBogeys: v.optional(v.number()),
    eagles: v.optional(v.number()),
    // Strokes Gained (when available)
    sgTotal: v.optional(v.number()),
    sgOtt: v.optional(v.number()),
    sgApp: v.optional(v.number()),
    sgArg: v.optional(v.number()),
    sgPutt: v.optional(v.number()),
    // Weather conditions
    windSpeed: v.optional(v.number()),
    temperature: v.optional(v.number()),
    conditions: v.optional(v.string()),      // "Sunny", "Rainy", etc.
  })
    .index("by_player", ["playerId"])
    .index("by_course", ["courseId"])
    .index("by_tournament_result", ["tournamentResultId"])
    .index("by_player_course", ["playerId", "courseId"])
    .index("by_year", ["year"]),
});