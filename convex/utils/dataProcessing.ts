// Data processing and validation helper functions for master JSON import

/**
 * Parse course name and extract venue information
 * Examples:
 *   "TPC Sawgrass (THE PLAYERS Stadium Course)" → { name: "TPC Sawgrass", variant: "THE PLAYERS Stadium Course" }
 *   "Augusta National Golf Club" → { name: "Augusta National Golf Club", variant: undefined }
 */
export function parseCourseInfo(courseNameRaw: string): {
  name: string;
  variant?: string;
  location?: string;
} {
  const trimmed = courseNameRaw.trim();

  // Check for parenthetical variant
  const variantMatch = trimmed.match(/^(.+?)\s*\((.+)\)$/);

  if (variantMatch) {
    return {
      name: variantMatch[1].trim(),
      variant: variantMatch[2].trim(),
    };
  }

  return {
    name: trimmed,
  };
}

/**
 * Parse earnings string to integer
 * Examples:
 *   "$240,250" → 240250
 *   "$1,782,000" → 1782000
 */
export function parseEarnings(earningsStr: string): number {
  if (!earningsStr) return 0;

  // Remove $, commas, and any whitespace
  const cleaned = earningsStr.replace(/[$,\s]/g, '');
  const parsed = parseInt(cleaned, 10);

  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse score to par string to number
 * Examples:
 *   "-15" → -15
 *   "+3" → 3
 *   "E" → 0
 */
export function parseScoreToPar(scoreStr: string): number {
  if (!scoreStr) return 0;

  const trimmed = scoreStr.trim();

  // Handle "E" for even
  if (trimmed === 'E' || trimmed === 'Even') return 0;

  // Remove + sign if present, parseInt handles - naturally
  const cleaned = trimmed.replace(/\+/g, '');
  const parsed = parseInt(cleaned, 10);

  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse total score string to number
 * Examples:
 *   "273" → 273
 *   "284" → 284
 */
export function parseTotalScore(scoreStr: string): number {
  if (!scoreStr) return 0;

  const parsed = parseInt(scoreStr, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Validate and clean position string
 * Examples:
 *   "T9" → "T9"
 *   "1" → "1"
 *   "MC" → "MC" (Missed Cut)
 */
export function cleanPosition(position: string | null): string {
  if (!position) return "Unknown";

  const trimmed = position.trim();

  // Common position patterns
  const validPatterns = [
    /^T?\d+$/,           // T9, 1, T25
    /^MC$/i,             // Missed Cut
    /^WD$/i,             // Withdrawal
    /^DQ$/i,             // Disqualified
    /^CUT$/i,            // Cut
  ];

  const isValid = validPatterns.some(pattern => pattern.test(trimmed));

  return isValid ? trimmed : "Unknown";
}

/**
 * Calculate round averages from array of rounds
 */
export function calculateRoundAverages(rounds: number[]): {
  r1Avg: number | undefined;
  r2Avg: number | undefined;
  r3Avg: number | undefined;
  r4Avg: number | undefined;
  earlyAvg: number | undefined;
  weekendAvg: number | undefined;
} {
  const r1Scores: number[] = [];
  const r2Scores: number[] = [];
  const r3Scores: number[] = [];
  const r4Scores: number[] = [];

  // For a single set of rounds, we just have one of each
  if (rounds.length >= 1) r1Scores.push(rounds[0]);
  if (rounds.length >= 2) r2Scores.push(rounds[1]);
  if (rounds.length >= 3) r3Scores.push(rounds[2]);
  if (rounds.length >= 4) r4Scores.push(rounds[3]);

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : undefined;

  const r1Avg = avg(r1Scores);
  const r2Avg = avg(r2Scores);
  const r3Avg = avg(r3Scores);
  const r4Avg = avg(r4Scores);

  const earlyScores = [...r1Scores, ...r2Scores];
  const weekendScores = [...r3Scores, ...r4Scores];

  return {
    r1Avg,
    r2Avg,
    r3Avg,
    r4Avg,
    earlyAvg: avg(earlyScores),
    weekendAvg: avg(weekendScores),
  };
}

/**
 * Extract unique courses from master JSON data
 */
export function extractUniqueCourses(masterData: any): Array<{
  name: string;
  variant?: string;
  tournamentNames: string[];
}> {
  const courseMap = new Map<string, {
    name: string;
    variant?: string;
    tournamentNames: Set<string>;
  }>();

  for (const player of masterData.players) {
    for (const tournament of player.tournaments) {
      if (!tournament.course_name) continue;

      const courseInfo = parseCourseInfo(tournament.course_name);
      const key = courseInfo.name;

      if (!courseMap.has(key)) {
        courseMap.set(key, {
          name: courseInfo.name,
          variant: courseInfo.variant,
          tournamentNames: new Set(),
        });
      }

      courseMap.get(key)!.tournamentNames.add(tournament.tournament_name);
    }
  }

  return Array.from(courseMap.values()).map(course => ({
    name: course.name,
    variant: course.variant,
    tournamentNames: Array.from(course.tournamentNames),
  }));
}

/**
 * Validate round scores array
 */
export function validateRounds(rounds: any[]): number[] {
  if (!Array.isArray(rounds)) return [];

  return rounds
    .filter(r => typeof r === 'number' && !isNaN(r) && r > 0 && r < 100)
    .slice(0, 4); // Max 4 rounds
}

/**
 * Generate course key for deduplication
 */
export function getCourseKey(courseName: string): string {
  const info = parseCourseInfo(courseName);
  return info.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

/**
 * Determine if a player made the cut based on position
 */
export function madeCut(position: string, rounds: number[]): boolean {
  const pos = position.toUpperCase();

  // Explicit cut indicators
  if (pos === 'MC' || pos === 'CUT') return false;
  if (pos === 'WD' || pos === 'DQ') return false; // Also didn't make cut

  // If they have 3 or 4 rounds, they made the cut
  if (rounds.length >= 3) return true;

  // If they have 1-2 rounds and a position number, they might have made cut
  // (This is an edge case, default to true if we have a numeric position)
  if (/^T?\d+$/.test(pos)) return true;

  return false;
}

/**
 * Parse tournament date to ISO format
 */
export function parseDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();

  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  } catch {
    return new Date().toISOString();
  }
}
