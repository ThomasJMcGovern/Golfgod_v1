// Schema Parser Utility
// Parses the GolfGod Convex schema and generates data for React Flow visualization

export interface SchemaColumn {
  name: string;
  type: string;
  required: boolean;
  isForeignKey: boolean;
  referencesTable?: string;
}

export interface SchemaTable {
  id: string;
  name: string;
  rowCount: string;
  columns: SchemaColumn[];
  indexes: string[];
  foreignKeys: string[];
  size: "small" | "medium" | "large";
  [key: string]: unknown; // Index signature for React Flow compatibility
  onSelect?: () => void; // Optional callback
}

export interface SchemaRelationship {
  id: string;
  source: string;
  sourceColumn: string;
  target: string;
  targetColumn: string;
  type: "one-to-many" | "many-to-one" | "many-to-many";
}

export interface ParsedSchema {
  tables: SchemaTable[];
  relationships: SchemaRelationship[];
}

/**
 * Parse the GolfGod database schema
 * This is a static representation based on convex/schema.ts
 */
export function parseSchema(): ParsedSchema {
  const tables: SchemaTable[] = [
    {
      id: "players",
      name: "players",
      rowCount: "~200",
      size: "small",
      columns: [
        { name: "_id", type: "ID", required: true, isForeignKey: false },
        { name: "name", type: "string", required: true, isForeignKey: false },
        { name: "firstName", type: "string", required: true, isForeignKey: false },
        { name: "lastName", type: "string", required: true, isForeignKey: false },
        { name: "country", type: "string", required: true, isForeignKey: false },
        { name: "countryCode", type: "string", required: true, isForeignKey: false },
        { name: "birthDate", type: "string", required: false, isForeignKey: false },
        { name: "birthPlace", type: "string", required: false, isForeignKey: false },
        { name: "college", type: "string", required: false, isForeignKey: false },
        { name: "swing", type: "Right|Left", required: false, isForeignKey: false },
        { name: "turnedPro", type: "number", required: false, isForeignKey: false },
        { name: "height", type: "string", required: false, isForeignKey: false },
        { name: "weight", type: "string", required: false, isForeignKey: false },
        { name: "photoUrl", type: "string", required: false, isForeignKey: false },
        { name: "worldRanking", type: "number", required: false, isForeignKey: false },
        { name: "tourRanking", type: "number", required: false, isForeignKey: false },
        { name: "espnId", type: "string", required: false, isForeignKey: false },
      ],
      indexes: ["by_name", "by_world_ranking", "search_name"],
      foreignKeys: [],
    },
    {
      id: "tournamentResults",
      name: "tournamentResults",
      rowCount: "20,745+",
      size: "large",
      columns: [
        { name: "_id", type: "ID", required: true, isForeignKey: false },
        { name: "playerId", type: "ID", required: true, isForeignKey: true, referencesTable: "players" },
        { name: "playerName", type: "string", required: true, isForeignKey: false },
        { name: "year", type: "number", required: true, isForeignKey: false },
        { name: "date", type: "string", required: true, isForeignKey: false },
        { name: "tournament", type: "string", required: true, isForeignKey: false },
        { name: "course", type: "string", required: false, isForeignKey: false },
        { name: "position", type: "string", required: true, isForeignKey: false },
        { name: "scores", type: "string[]", required: false, isForeignKey: false },
        { name: "totalScore", type: "number", required: false, isForeignKey: false },
        { name: "toPar", type: "number", required: false, isForeignKey: false },
        { name: "score", type: "string", required: true, isForeignKey: false },
        { name: "overall", type: "string", required: true, isForeignKey: false },
        { name: "earnings", type: "number", required: false, isForeignKey: false },
      ],
      indexes: ["by_player", "by_player_year", "by_tournament", "by_year", "by_player_name"],
      foreignKeys: ["playerId → players._id"],
    },
    {
      id: "courses",
      name: "courses",
      rowCount: "~54",
      size: "small",
      columns: [
        { name: "_id", type: "ID", required: true, isForeignKey: false },
        { name: "name", type: "string", required: true, isForeignKey: false },
        { name: "location", type: "string", required: true, isForeignKey: false },
        { name: "par", type: "number", required: true, isForeignKey: false },
        { name: "yardage", type: "number", required: false, isForeignKey: false },
        { name: "established", type: "number", required: false, isForeignKey: false },
        { name: "designer", type: "string", required: false, isForeignKey: false },
        { name: "type", type: "string", required: false, isForeignKey: false },
        { name: "grassType", type: "string", required: false, isForeignKey: false },
        { name: "stimpmeter", type: "number", required: false, isForeignKey: false },
      ],
      indexes: ["by_name"],
      foreignKeys: [],
    },
    {
      id: "tournamentCourses",
      name: "tournamentCourses",
      rowCount: "Variable",
      size: "small",
      columns: [
        { name: "_id", type: "ID", required: true, isForeignKey: false },
        { name: "tournamentName", type: "string", required: true, isForeignKey: false },
        { name: "courseId", type: "ID", required: true, isForeignKey: true, referencesTable: "courses" },
        { name: "yearStart", type: "number", required: true, isForeignKey: false },
        { name: "yearEnd", type: "number", required: false, isForeignKey: false },
        { name: "isPrimary", type: "boolean", required: true, isForeignKey: false },
      ],
      indexes: ["by_tournament", "by_course", "by_tournament_year"],
      foreignKeys: ["courseId → courses._id"],
    },
    {
      id: "playerCourseStats",
      name: "playerCourseStats",
      rowCount: "~2,700",
      size: "medium",
      columns: [
        { name: "_id", type: "ID", required: true, isForeignKey: false },
        { name: "playerId", type: "ID", required: true, isForeignKey: true, referencesTable: "players" },
        { name: "courseId", type: "ID", required: true, isForeignKey: true, referencesTable: "courses" },
        { name: "roundsPlayed", type: "number", required: true, isForeignKey: false },
        { name: "scoringAverage", type: "number", required: true, isForeignKey: false },
        { name: "bestScore", type: "number", required: true, isForeignKey: false },
        { name: "worstScore", type: "number", required: true, isForeignKey: false },
        { name: "cutsPlayed", type: "number", required: true, isForeignKey: false },
        { name: "cutsMade", type: "number", required: true, isForeignKey: false },
        { name: "wins", type: "number", required: true, isForeignKey: false },
        { name: "top10s", type: "number", required: true, isForeignKey: false },
        { name: "top25s", type: "number", required: true, isForeignKey: false },
        { name: "totalEarnings", type: "number", required: true, isForeignKey: false },
        { name: "avgR1Score", type: "number", required: false, isForeignKey: false },
        { name: "avgR2Score", type: "number", required: false, isForeignKey: false },
        { name: "avgR3Score", type: "number", required: false, isForeignKey: false },
        { name: "avgR4Score", type: "number", required: false, isForeignKey: false },
        { name: "avgEarlyScore", type: "number", required: false, isForeignKey: false },
        { name: "avgWeekendScore", type: "number", required: false, isForeignKey: false },
        { name: "lastUpdated", type: "number", required: true, isForeignKey: false },
        { name: "lastTournamentYear", type: "number", required: true, isForeignKey: false },
      ],
      indexes: ["by_player", "by_course", "by_player_course"],
      foreignKeys: ["playerId → players._id", "courseId → courses._id"],
    },
    {
      id: "roundStats",
      name: "roundStats",
      rowCount: "Pending",
      size: "large",
      columns: [
        { name: "_id", type: "ID", required: true, isForeignKey: false },
        { name: "playerId", type: "ID", required: true, isForeignKey: true, referencesTable: "players" },
        { name: "courseId", type: "ID", required: true, isForeignKey: true, referencesTable: "courses" },
        { name: "tournamentResultId", type: "ID", required: true, isForeignKey: true, referencesTable: "tournamentResults" },
        { name: "year", type: "number", required: true, isForeignKey: false },
        { name: "round", type: "number", required: true, isForeignKey: false },
        { name: "score", type: "number", required: true, isForeignKey: false },
        { name: "toPar", type: "number", required: true, isForeignKey: false },
        { name: "teeTime", type: "string", required: false, isForeignKey: false },
        { name: "fairwaysHit", type: "number", required: false, isForeignKey: false },
        { name: "greensHit", type: "number", required: false, isForeignKey: false },
        { name: "putts", type: "number", required: false, isForeignKey: false },
      ],
      indexes: ["by_player", "by_course", "by_tournament_result", "by_player_course", "by_year"],
      foreignKeys: ["playerId → players._id", "courseId → courses._id", "tournamentResultId → tournamentResults._id"],
    },
    {
      id: "pgaTournaments",
      name: "pgaTournaments",
      rowCount: "~1,100",
      size: "medium",
      columns: [
        { name: "_id", type: "ID", required: true, isForeignKey: false },
        { name: "tournament_id", type: "string", required: true, isForeignKey: false },
        { name: "name", type: "string", required: true, isForeignKey: false },
        { name: "year", type: "number", required: true, isForeignKey: false },
        { name: "dates_raw", type: "string", required: false, isForeignKey: false },
        { name: "start_date", type: "string", required: false, isForeignKey: false },
        { name: "end_date", type: "string", required: false, isForeignKey: false },
        { name: "winner_name", type: "string", required: false, isForeignKey: false },
        { name: "status", type: "string", required: true, isForeignKey: false },
      ],
      indexes: ["by_year", "by_winner", "by_tournament_id", "by_year_and_name", "by_status"],
      foreignKeys: [],
    },
    {
      id: "playerStats",
      name: "playerStats",
      rowCount: "Variable",
      size: "small",
      columns: [
        { name: "_id", type: "ID", required: true, isForeignKey: false },
        { name: "playerId", type: "ID", required: true, isForeignKey: true, referencesTable: "players" },
        { name: "year", type: "number", required: true, isForeignKey: false },
        { name: "avgSgApp", type: "number", required: false, isForeignKey: false },
        { name: "fairwaysHit", type: "number", required: false, isForeignKey: false },
        { name: "avgPutts", type: "number", required: false, isForeignKey: false },
        { name: "tournaments", type: "number", required: false, isForeignKey: false },
        { name: "wins", type: "number", required: false, isForeignKey: false },
        { name: "top10s", type: "number", required: false, isForeignKey: false },
        { name: "earnings", type: "number", required: false, isForeignKey: false },
      ],
      indexes: ["by_player_year"],
      foreignKeys: ["playerId → players._id"],
    },
    {
      id: "userFollows",
      name: "userFollows",
      rowCount: "Variable",
      size: "small",
      columns: [
        { name: "_id", type: "ID", required: true, isForeignKey: false },
        { name: "userId", type: "string", required: true, isForeignKey: false },
        { name: "playerId", type: "ID", required: true, isForeignKey: true, referencesTable: "players" },
        { name: "followedAt", type: "number", required: true, isForeignKey: false },
      ],
      indexes: ["by_user", "by_user_player"],
      foreignKeys: ["playerId → players._id"],
    },
  ];

  const relationships: SchemaRelationship[] = [
    // players → tournamentResults
    {
      id: "rel_1",
      source: "tournamentResults",
      sourceColumn: "playerId",
      target: "players",
      targetColumn: "_id",
      type: "many-to-one",
    },
    // courses → tournamentCourses
    {
      id: "rel_2",
      source: "tournamentCourses",
      sourceColumn: "courseId",
      target: "courses",
      targetColumn: "_id",
      type: "many-to-one",
    },
    // players → playerCourseStats
    {
      id: "rel_3",
      source: "playerCourseStats",
      sourceColumn: "playerId",
      target: "players",
      targetColumn: "_id",
      type: "many-to-one",
    },
    // courses → playerCourseStats
    {
      id: "rel_4",
      source: "playerCourseStats",
      sourceColumn: "courseId",
      target: "courses",
      targetColumn: "_id",
      type: "many-to-one",
    },
    // players → roundStats
    {
      id: "rel_5",
      source: "roundStats",
      sourceColumn: "playerId",
      target: "players",
      targetColumn: "_id",
      type: "many-to-one",
    },
    // courses → roundStats
    {
      id: "rel_6",
      source: "roundStats",
      sourceColumn: "courseId",
      target: "courses",
      targetColumn: "_id",
      type: "many-to-one",
    },
    // tournamentResults → roundStats
    {
      id: "rel_7",
      source: "roundStats",
      sourceColumn: "tournamentResultId",
      target: "tournamentResults",
      targetColumn: "_id",
      type: "many-to-one",
    },
    // players → playerStats
    {
      id: "rel_8",
      source: "playerStats",
      sourceColumn: "playerId",
      target: "players",
      targetColumn: "_id",
      type: "many-to-one",
    },
    // players → userFollows
    {
      id: "rel_9",
      source: "userFollows",
      sourceColumn: "playerId",
      target: "players",
      targetColumn: "_id",
      type: "many-to-one",
    },
  ];

  return { tables, relationships };
}

/**
 * Get color based on table size
 */
export function getTableColor(size: "small" | "medium" | "large"): string {
  switch (size) {
    case "small":
      return "hsl(142, 76%, 36%)"; // Green
    case "medium":
      return "hsl(45, 100%, 51%)"; // Yellow
    case "large":
      return "hsl(0, 84%, 60%)"; // Red
    default:
      return "hsl(142, 76%, 36%)";
  }
}
