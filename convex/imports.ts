import { mutation } from "./_generated/server";
import { v } from "convex/values";

const BATCH_SIZE = 25; // Optimal batch size to avoid Convex limits

// Helper function to get country info
function getCountryInfo(code: string): { name: string; code: string } {
  const countryMap: Record<string, { name: string; code: string }> = {
    "UNI": { name: "United States", code: "US" },
    "USA": { name: "United States", code: "US" },
    "NOR": { name: "Northern Ireland", code: "GB-NIR" },
    "ENG": { name: "England", code: "GB-ENG" },
    "SCO": { name: "Scotland", code: "GB-SCT" },
    "WAL": { name: "Wales", code: "GB-WLS" },
    "AUS": { name: "Australia", code: "AU" },
    "CAN": { name: "Canada", code: "CA" },
    "SOU": { name: "South Africa", code: "ZA" },
    "RSA": { name: "South Africa", code: "ZA" },
    "SWE": { name: "Sweden", code: "SE" },
    "JAP": { name: "Japan", code: "JP" },
    "JPN": { name: "Japan", code: "JP" },
    "IRE": { name: "Ireland", code: "IE" },
    "NEW": { name: "New Zealand", code: "NZ" },
    "NZL": { name: "New Zealand", code: "NZ" },
    "BEL": { name: "Belgium", code: "BE" },
    "SPA": { name: "Spain", code: "ES" },
    "ESP": { name: "Spain", code: "ES" },
    "FRA": { name: "France", code: "FR" },
    "GER": { name: "Germany", code: "DE" },
    "DEU": { name: "Germany", code: "DE" },
    "DEN": { name: "Denmark", code: "DK" },
    "DNK": { name: "Denmark", code: "DK" },
    "COL": { name: "Colombia", code: "CO" },
    "VEN": { name: "Venezuela", code: "VE" },
    "CHI": { name: "China", code: "CN" },
    "CHN": { name: "China", code: "CN" },
    "ARG": { name: "Argentina", code: "AR" },
    "PHI": { name: "Philippines", code: "PH" },
    "PHL": { name: "Philippines", code: "PH" },
    "FIN": { name: "Finland", code: "FI" },
    "MEX": { name: "Mexico", code: "MX" },
    "ITA": { name: "Italy", code: "IT" },
    "ZIM": { name: "Zimbabwe", code: "ZW" },
    "AUT": { name: "Austria", code: "AT" },
    "KOR": { name: "South Korea", code: "KR" },
    "IND": { name: "India", code: "IN" },
    "THA": { name: "Thailand", code: "TH" },
    "NED": { name: "Netherlands", code: "NL" },
    "POR": { name: "Portugal", code: "PT" },
    "PRT": { name: "Portugal", code: "PT" },
  };

  return countryMap[code] || { name: "Unknown", code: "XX" };
}

// Import player biographical data from CSV
export const importPlayerBios = mutation({
  args: {
    bios: v.array(
      v.object({
        name: v.string(),
        firstName: v.string(),
        lastName: v.string(),
        country: v.optional(v.string()),
        countryCode: v.optional(v.string()),
        birthDate: v.optional(v.string()),
        birthPlace: v.optional(v.string()),
        college: v.optional(v.string()),
        swing: v.optional(v.string()),
        turnedPro: v.optional(v.number()),
        height: v.optional(v.string()),
        weight: v.optional(v.string()),
        photoUrl: v.optional(v.string()),
        espnId: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[],
    };

    for (const bio of args.bios) {
      try {
        // Check if player already exists
        const existing = await ctx.db
          .query("players")
          .withSearchIndex("search_name", (q) => q.search("name", bio.name))
          .take(1);

        if (existing.length > 0) {
          // Update existing player
          const player = existing[0];
          await ctx.db.patch(player._id, {
            birthDate: bio.birthDate || player.birthDate,
            birthPlace: bio.birthPlace || player.birthPlace,
            college: bio.college || player.college,
            swing: bio.swing as "Right" | "Left" | undefined,
            turnedPro: bio.turnedPro || player.turnedPro,
            height: bio.height || player.height,
            weight: bio.weight || player.weight,
            photoUrl: bio.photoUrl || player.photoUrl,
            espnId: bio.espnId || player.espnId,
          });
          results.updated++;
        } else {
          // Create new player
          const countryInfo = getCountryInfo(bio.countryCode || bio.country || "");

          await ctx.db.insert("players", {
            name: bio.name,
            firstName: bio.firstName,
            lastName: bio.lastName,
            country: bio.country || countryInfo.name,
            countryCode: bio.countryCode || countryInfo.code,
            birthDate: bio.birthDate,
            birthPlace: bio.birthPlace,
            college: bio.college,
            swing: bio.swing as "Right" | "Left" | undefined,
            turnedPro: bio.turnedPro,
            height: bio.height,
            weight: bio.weight,
            photoUrl: bio.photoUrl,
            espnId: bio.espnId,
          });
          results.created++;
        }
      } catch (error) {
        results.errors.push(
          `Failed to import ${bio.name}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    return results;
  },
});

// Import world rankings
export const importWorldRankings = mutation({
  args: {
    rankings: v.array(
      v.object({
        rank: v.number(),
        name: v.string(),
        country: v.string(),
      })
    ),
    clearExisting: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const results = {
      updated: 0,
      created: 0,
      errors: [] as string[],
    };

    // Clear existing rankings if requested
    if (args.clearExisting) {
      const players = await ctx.db.query("players").collect();
      for (const player of players) {
        if (player.worldRanking) {
          await ctx.db.patch(player._id, { worldRanking: undefined });
        }
      }
    }

    // Sort rankings to ensure proper order
    const sortedRankings = [...args.rankings].sort((a, b) => a.rank - b.rank);

    // Process in batches
    for (let i = 0; i < sortedRankings.length; i += BATCH_SIZE) {
      const batch = sortedRankings.slice(i, Math.min(i + BATCH_SIZE, sortedRankings.length));

      for (const ranking of batch) {
        try {
          // Find player by name
          const players = await ctx.db
            .query("players")
            .withSearchIndex("search_name", (q) => q.search("name", ranking.name))
            .take(1);

          if (players.length > 0) {
            // Update existing player
            await ctx.db.patch(players[0]._id, {
              worldRanking: ranking.rank,
            });
            results.updated++;
          } else {
            // Create new player with ranking
            const nameParts = ranking.name.split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";
            const countryInfo = getCountryInfo(ranking.country);

            await ctx.db.insert("players", {
              name: ranking.name,
              firstName,
              lastName,
              country: countryInfo.name,
              countryCode: countryInfo.code,
              worldRanking: ranking.rank,
            });
            results.created++;
          }
        } catch (error) {
          results.errors.push(
            `Failed rank ${ranking.rank} - ${ranking.name}: ${
              error instanceof Error ? error.message : "Unknown"
            }`
          );
        }
      }
    }

    return results;
  },
});

// Import tournament results (original format)
export const importTournamentResults = mutation({
  args: {
    results: v.array(
      v.object({
        playerName: v.string(),
        year: v.number(),
        date: v.string(),
        tournament: v.string(),
        position: v.string(),
        score: v.string(),
        overall: v.string(),
        earnings: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const importResults = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const result of args.results) {
      try {
        // Find player by name
        const players = await ctx.db
          .query("players")
          .withSearchIndex("search_name", (q) => q.search("name", result.playerName))
          .take(1);

        if (players.length === 0) {
          importResults.errors.push(`Player not found: ${result.playerName}`);
          importResults.failed++;
          continue;
        }

        const player = players[0];

        // Insert tournament result
        await ctx.db.insert("tournamentResults", {
          playerId: player._id,
          playerName: result.playerName,
          year: result.year,
          date: result.date,
          tournament: result.tournament,
          position: result.position,
          score: result.score,
          overall: result.overall,
          earnings: result.earnings,
        });

        importResults.success++;
      } catch (error) {
        importResults.failed++;
        importResults.errors.push(
          `Failed ${result.playerName} at ${result.tournament}: ${
            error instanceof Error ? error.message : "Unknown"
          }`
        );
      }
    }

    return importResults;
  },
});

// Import tournament results from JSON format (new detailed format)
export const importTournamentResultsJSON = mutation({
  args: {
    playerName: v.string(),
    years: v.array(
      v.object({
        year: v.number(),
        tournaments: v.array(
          v.object({
            date: v.string(),
            tournament: v.string(),
            course: v.optional(v.string()),
            position: v.string(),
            scores: v.optional(v.array(v.string())),
            totalScore: v.optional(v.number()),
            toPar: v.optional(v.number()),
            earnings: v.optional(v.number()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Find player
    const players = await ctx.db
      .query("players")
      .withSearchIndex("search_name", (q) => q.search("name", args.playerName))
      .take(1);

    if (players.length === 0) {
      throw new Error(`Player not found: ${args.playerName}`);
    }

    const player = players[0];
    let imported = 0;
    const errors: string[] = [];

    // Process each year
    for (const yearData of args.years) {
      for (const tournament of yearData.tournaments) {
        try {
          // Calculate display score
          let displayScore = "";
          if (tournament.toPar !== undefined) {
            if (tournament.toPar === 0) {
              displayScore = "E";
            } else if (tournament.toPar > 0) {
              displayScore = `+${tournament.toPar}`;
            } else {
              displayScore = `${tournament.toPar}`;
            }
          } else if (tournament.scores) {
            displayScore = tournament.scores.join("-");
          }

          // Calculate overall display
          const overall = tournament.totalScore
            ? tournament.totalScore.toString()
            : tournament.scores
            ? tournament.scores.join("-")
            : "";

          await ctx.db.insert("tournamentResults", {
            playerId: player._id,
            playerName: args.playerName,
            year: yearData.year,
            date: tournament.date,
            tournament: tournament.tournament,
            course: tournament.course,
            position: tournament.position,
            scores: tournament.scores,
            totalScore: tournament.totalScore,
            toPar: tournament.toPar,
            score: displayScore,
            overall: overall,
            earnings: tournament.earnings,
          });
          imported++;
        } catch (error) {
          errors.push(`Failed: ${yearData.year} - ${tournament.tournament}`);
        }
      }
    }

    return {
      imported,
      errors,
      playerName: args.playerName,
    };
  },
});

// Batch import tournament results from multiple players
export const batchImportTournamentResults = mutation({
  args: {
    players: v.array(
      v.object({
        playerName: v.string(),
        years: v.array(
          v.object({
            year: v.number(),
            tournaments: v.array(
              v.object({
                date: v.string(),
                tournament: v.string(),
                course: v.optional(v.string()),
                position: v.string(),
                scores: v.optional(v.array(v.string())),
                totalScore: v.optional(v.number()),
                toPar: v.optional(v.number()),
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
      playersProcessed: 0,
      errors: [] as string[],
    };

    for (const playerData of args.players) {
      try {
        // Find player
        const players = await ctx.db
          .query("players")
          .withSearchIndex("search_name", (q) =>
            q.search("name", playerData.playerName)
          )
          .take(1);

        if (players.length === 0) {
          summary.errors.push(`Player not found: ${playerData.playerName}`);
          continue;
        }

        const player = players[0];

        // Import their results
        for (const yearData of playerData.years) {
          for (const tournament of yearData.tournaments) {
            try {
              // Calculate display score
              let displayScore = "";
              if (tournament.toPar !== undefined) {
                if (tournament.toPar === 0) {
                  displayScore = "E";
                } else if (tournament.toPar > 0) {
                  displayScore = `+${tournament.toPar}`;
                } else {
                  displayScore = `${tournament.toPar}`;
                }
              } else if (tournament.scores) {
                displayScore = tournament.scores.join("-");
              }

              const overall = tournament.totalScore
                ? tournament.totalScore.toString()
                : tournament.scores
                ? tournament.scores.join("-")
                : "";

              await ctx.db.insert("tournamentResults", {
                playerId: player._id,
                playerName: playerData.playerName,
                year: yearData.year,
                date: tournament.date,
                tournament: tournament.tournament,
                course: tournament.course,
                position: tournament.position,
                scores: tournament.scores,
                totalScore: tournament.totalScore,
                toPar: tournament.toPar,
                score: displayScore,
                overall: overall,
                earnings: tournament.earnings,
              });
              summary.totalImported++;
            } catch (error) {
              // Continue on individual tournament errors
            }
          }
        }

        summary.playersProcessed++;
      } catch (error) {
        summary.errors.push(`Failed processing: ${playerData.playerName}`);
      }
    }

    return summary;
  },
});

// Import player stats
export const importPlayerStats = mutation({
  args: {
    stats: v.array(
      v.object({
        playerName: v.string(),
        year: v.number(),
        avgSgApp: v.optional(v.number()),
        fairwaysHit: v.optional(v.number()),
        avgPutts: v.optional(v.number()),
        tournaments: v.optional(v.number()),
        wins: v.optional(v.number()),
        top10s: v.optional(v.number()),
        earnings: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results = {
      imported: 0,
      errors: [] as string[],
    };

    for (const stat of args.stats) {
      try {
        // Find player
        const players = await ctx.db
          .query("players")
          .withSearchIndex("search_name", (q) => q.search("name", stat.playerName))
          .take(1);

        if (players.length === 0) {
          results.errors.push(`Player not found: ${stat.playerName}`);
          continue;
        }

        const player = players[0];

        // Check if stats already exist for this year
        const existing = await ctx.db
          .query("playerStats")
          .withIndex("by_player_year", (q) =>
            q.eq("playerId", player._id).eq("year", stat.year)
          )
          .first();

        if (existing) {
          // Update existing stats
          await ctx.db.patch(existing._id, {
            avgSgApp: stat.avgSgApp,
            fairwaysHit: stat.fairwaysHit,
            avgPutts: stat.avgPutts,
            tournaments: stat.tournaments,
            wins: stat.wins,
            top10s: stat.top10s,
            earnings: stat.earnings,
          });
        } else {
          // Insert new stats
          await ctx.db.insert("playerStats", {
            playerId: player._id,
            year: stat.year,
            avgSgApp: stat.avgSgApp,
            fairwaysHit: stat.fairwaysHit,
            avgPutts: stat.avgPutts,
            tournaments: stat.tournaments,
            wins: stat.wins,
            top10s: stat.top10s,
            earnings: stat.earnings,
          });
        }

        results.imported++;
      } catch (error) {
        results.errors.push(
          `Failed ${stat.playerName} (${stat.year}): ${
            error instanceof Error ? error.message : "Unknown"
          }`
        );
      }
    }

    return results;
  },
});