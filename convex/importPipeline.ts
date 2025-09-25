import { mutation, query, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

// Shared function for importing tournament data
async function importTournamentData(ctx: MutationCtx, args: {
  playerId: string;
  playerName: string;
  years: Array<{
    year: number;
    tournaments: Array<{
      date: string;
      tournament_name: string;
      course?: string;
      position: string;
      scores?: string[];
      total_score?: number;
      to_par?: number;
      earnings?: number;
    }>;
  }>;
}) {
    // Try to find player by name first
    let players = await ctx.db
      .query("players")
      .withSearchIndex("search_name", (q) => q.search("name", args.playerName))
      .take(1);

    // If not found by name, try variations
    if (players.length === 0) {
      // Try with underscores replaced with spaces
      const normalizedName = args.playerName.replace(/_/g, " ");
      players = await ctx.db
        .query("players")
        .withSearchIndex("search_name", (q) => q.search("name", normalizedName))
        .take(1);
    }

    if (players.length === 0) {
      // Create player if not exists
      const nameParts = args.playerName.replace(/_/g, " ").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const newPlayerId = await ctx.db.insert("players", {
        name: args.playerName.replace(/_/g, " "),
        firstName,
        lastName,
        country: "United States", // Default, can be updated later
        countryCode: "US",
        espnId: args.playerId,
      });

      const newPlayer = await ctx.db.get(newPlayerId);
      if (!newPlayer) throw new Error("Failed to create player");
      players = [newPlayer];
    }

    const player = players[0];
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Update player's ESPN ID if not set
    if (!player.espnId && args.playerId) {
      await ctx.db.patch(player._id, { espnId: args.playerId });
    }

    // Process each year
    for (const yearData of args.years) {
      for (const tournament of yearData.tournaments) {
        try {
          // Skip if already exists (check for duplicates)
          const existing = await ctx.db
            .query("tournamentResults")
            .withIndex("by_player_year", (q) =>
              q.eq("playerId", player._id).eq("year", yearData.year)
            )
            .filter((q) =>
              q.and(
                q.eq(q.field("tournament"), tournament.tournament_name),
                q.eq(q.field("date"), tournament.date)
              )
            )
            .first();

          if (existing) {
            skipped++;
            continue;
          }

          // Calculate display score
          let displayScore = "";
          if (tournament.to_par !== undefined && tournament.to_par !== -78) {
            // -78 seems to be a placeholder for MC/WD
            if (tournament.to_par === 0) {
              displayScore = "E";
            } else if (tournament.to_par > 0) {
              displayScore = `+${tournament.to_par}`;
            } else {
              displayScore = `${tournament.to_par}`;
            }
          } else if (tournament.scores && tournament.scores.length > 0) {
            displayScore = tournament.scores.join("-");
          }

          // Calculate overall display
          const overall = tournament.total_score
            ? tournament.total_score.toString()
            : tournament.scores && tournament.scores.length > 0
            ? `${tournament.total_score} (${displayScore})`
            : "";

          await ctx.db.insert("tournamentResults", {
            playerId: player._id,
            playerName: player.name,
            year: yearData.year,
            date: tournament.date,
            tournament: tournament.tournament_name,
            course: tournament.course || undefined,
            position: tournament.position,
            scores: tournament.scores || undefined,
            totalScore: tournament.total_score || undefined,
            toPar: tournament.to_par !== -78 ? tournament.to_par : undefined,
            score: displayScore || "-",
            overall: overall || "-",
            earnings: tournament.earnings || undefined,
          });
          imported++;
        } catch (error) {
          errors.push(
            `Failed: ${yearData.year} - ${tournament.tournament_name}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }
    }

    return {
      playerId: player._id,
      playerName: player.name,
      imported,
      skipped,
      errors,
      message: `Imported ${imported} results, skipped ${skipped} duplicates`,
    };
}

// Export the mutation that uses the shared function
export const importTournamentDataFromJSON = mutation({
  args: {
    playerId: v.string(),
    playerName: v.string(),
    years: v.array(
      v.object({
        year: v.number(),
        tournaments: v.array(
          v.object({
            date: v.string(),
            tournament_name: v.string(),
            course: v.optional(v.string()),
            position: v.string(),
            scores: v.optional(v.array(v.string())),
            total_score: v.optional(v.number()),
            to_par: v.optional(v.number()),
            earnings: v.optional(v.number()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => importTournamentData(ctx, args),
});

// Batch import multiple players
export const batchImportFromJSONFiles = mutation({
  args: {
    players: v.array(
      v.object({
        player_id: v.string(),
        playerName: v.string(), // Extracted from filename
        years: v.array(
          v.object({
            year: v.number(),
            tournaments: v.array(
              v.object({
                date: v.string(),
                tournament_name: v.string(),
                course: v.optional(v.string()),
                position: v.string(),
                scores: v.optional(v.array(v.string())),
                total_score: v.optional(v.number()),
                to_par: v.optional(v.number()),
                earnings: v.optional(v.number()),
              })
            ),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const summary = {
      totalImported: 0,
      totalSkipped: 0,
      playersProcessed: 0,
      playersCreated: 0,
      errors: [] as string[],
    };

    for (const playerData of args.players) {
      try {
        // Import using the shared function
        const result = await importTournamentData(ctx, {
          playerId: playerData.player_id,
          playerName: playerData.playerName,
          years: playerData.years,
        });

        summary.totalImported += result.imported;
        summary.totalSkipped += result.skipped;
        summary.playersProcessed++;

        if (result.errors.length > 0) {
          summary.errors.push(
            `${playerData.playerName}: ${result.errors.length} errors`
          );
        }
      } catch (error) {
        summary.errors.push(
          `Failed ${playerData.playerName}: ${
            error instanceof Error ? error.message : "Unknown"
          }`
        );
      }
    }

    return {
      ...summary,
      message: `Processed ${summary.playersProcessed} players: ${summary.totalImported} imported, ${summary.totalSkipped} skipped`,
    };
  },
});

// Get import progress
export const getImportProgress = query({
  handler: async (ctx) => {
    const players = await ctx.db.query("players").collect();
    const results = await ctx.db.query("tournamentResults").take(1000);

    // Count players with results
    const playersWithResults = new Set(results.map((r) => r.playerId)).size;

    // Get recent imports
    const recentResults = results
      .sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0))
      .slice(0, 10);

    // Count by year
    const yearCounts: Record<number, number> = {};
    for (const result of results) {
      yearCounts[result.year] = (yearCounts[result.year] || 0) + 1;
    }

    // Players with ESPN IDs
    const playersWithEspnId = players.filter((p) => p.espnId).length;

    return {
      totalPlayers: players.length,
      playersWithResults,
      playersWithEspnId,
      totalResults: results.length,
      yearCounts: Object.entries(yearCounts).sort(
        ([a], [b]) => Number(b) - Number(a)
      ),
      recentImports: recentResults.map((r) => ({
        player: r.playerName,
        tournament: r.tournament,
        year: r.year,
      })),
    };
  },
});

// Clear all tournament results before import
export const clearResultsBeforeImport = mutation({
  args: {
    playerName: v.optional(v.string()), // Clear specific player or all
  },
  handler: async (ctx, args) => {
    let deleted = 0;

    if (args.playerName) {
      // Find player
      const players = await ctx.db
        .query("players")
        .withSearchIndex("search_name", (q) => q.search("name", args.playerName || ""))
        .take(1);

      if (players.length > 0) {
        const results = await ctx.db
          .query("tournamentResults")
          .withIndex("by_player", (q) => q.eq("playerId", players[0]._id))
          .collect();

        for (const result of results) {
          await ctx.db.delete(result._id);
          deleted++;
        }
      }
    } else {
      // Clear all
      const results = await ctx.db.query("tournamentResults").take(100);
      while (results.length > 0) {
        for (const result of results) {
          await ctx.db.delete(result._id);
          deleted++;
        }
        const moreResults = await ctx.db.query("tournamentResults").take(100);
        if (moreResults.length === 0) break;
      }
    }

    return {
      deleted,
      message: `Cleared ${deleted} tournament results`,
    };
  },
});

// Validate imported data
export const validateImportedData = query({
  handler: async (ctx) => {
    const validation = {
      playersWithoutResults: [] as string[],
      resultsWithoutScores: 0,
      resultsWithoutEarnings: 0,
      yearsWithData: new Set<number>(),
      tournamentsCount: new Set<string>(),
      issues: [] as string[],
    };

    // Get all players and results
    const players = await ctx.db.query("players").collect();
    const results = await ctx.db.query("tournamentResults").take(1000);

    // Find players without results
    const playersWithResults = new Set(results.map((r) => r.playerId));
    for (const player of players) {
      if (!playersWithResults.has(player._id)) {
        validation.playersWithoutResults.push(player.name);
      }
    }

    // Analyze results
    for (const result of results) {
      if (!result.scores || result.scores.length === 0) {
        validation.resultsWithoutScores++;
      }
      if (result.earnings === null || result.earnings === undefined) {
        validation.resultsWithoutEarnings++;
      }
      validation.yearsWithData.add(result.year);
      validation.tournamentsCount.add(result.tournament);
    }

    // Check for issues
    if (validation.playersWithoutResults.length > 0) {
      validation.issues.push(
        `${validation.playersWithoutResults.length} players have no results`
      );
    }
    if (validation.resultsWithoutScores > results.length * 0.1) {
      validation.issues.push(
        `${validation.resultsWithoutScores} results missing scores`
      );
    }

    // Check year coverage
    const yearArray = Array.from(validation.yearsWithData).sort();
    const expectedYears = Array.from({ length: 11 }, (_, i) => 2015 + i);
    const missingYears = expectedYears.filter((y) => !validation.yearsWithData.has(y));

    if (missingYears.length > 0) {
      validation.issues.push(`Missing data for years: ${missingYears.join(", ")}`);
    }

    return {
      playersTotal: players.length,
      playersWithResults: playersWithResults.size,
      playersWithoutResults: validation.playersWithoutResults.slice(0, 10),
      totalResults: results.length,
      resultsWithScores: results.length - validation.resultsWithoutScores,
      resultsWithEarnings: results.length - validation.resultsWithoutEarnings,
      yearsCovered: yearArray,
      uniqueTournaments: validation.tournamentsCount.size,
      issues: validation.issues,
      isValid: validation.issues.length === 0,
    };
  },
});