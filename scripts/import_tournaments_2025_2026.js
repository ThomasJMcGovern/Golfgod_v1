/**
 * Import 2025 and 2026 PGA Tour tournament data from JSON file
 * Usage: node scripts/import_tournaments_2025_2026.js
 */

const fs = require("fs");
const path = require("path");

// Read the JSON file
const jsonPath = "/Users/tjmcgovern/golfdata/pga_tour_schedules_playwright_2025_2026.json";
const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

// Convex deployment URL - will be loaded from .env.local
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("Error: NEXT_PUBLIC_CONVEX_URL not found in .env.local");
  process.exit(1);
}

const { ConvexHttpClient } = require("convex/browser");
const { api } = require("../convex/_generated/api");

const client = new ConvexHttpClient(CONVEX_URL);

async function importTournaments() {
  console.log(`\n🏌️ Starting tournament import from ${jsonPath}`);
  console.log(`📊 Total tournaments in JSON: ${jsonData.tournaments.length}\n`);

  // Filter and transform tournaments for 2025 and 2026
  const tournaments2025 = jsonData.tournaments.filter(t => t.year === 2025);
  const tournaments2026 = jsonData.tournaments.filter(t => t.year === 2026);

  console.log(`📅 2025 tournaments: ${tournaments2025.length}`);
  console.log(`📅 2026 tournaments: ${tournaments2026.length}\n`);

  // Transform data to match Convex schema
  const transformTournament = (t) => {
    const tournament = {
      tournament_id: t.tournament_id,
      name: t.name,
      year: t.year,
      status: t.status,
      scraped_at: t.scraped_at,
    };

    // Optional fields
    if (t.dates_raw) tournament.dates_raw = t.dates_raw;
    if (t.start_date) tournament.start_date = t.start_date;
    if (t.end_date) tournament.end_date = t.end_date;
    if (t.espn_tournament_id) tournament.espn_tournament_id = t.espn_tournament_id;
    if (t.espn_leaderboard_url) tournament.espn_leaderboard_url = t.espn_leaderboard_url;
    if (t.prize_money) tournament.prize_money = t.prize_money;

    // Handle winner fields for completed tournaments
    if (t.status === "completed") {
      if (t.winner_name) tournament.winner_name = t.winner_name;
      if (t.winner_espn_id) tournament.winner_espn_id = t.winner_espn_id;
      if (t.winner_profile_url) tournament.winner_profile_url = t.winner_profile_url;
      if (t.winning_score && t.winning_score !== "") tournament.winning_score = t.winning_score;
    }

    // Handle previous_winner fields for scheduled tournaments
    if (t.status === "scheduled") {
      if (t.previous_winner_name) tournament.previous_winner_name = t.previous_winner_name;
      if (t.previous_winner_espn_id) tournament.previous_winner_espn_id = t.previous_winner_espn_id;
      if (t.previous_winner_profile_url) tournament.previous_winner_profile_url = t.previous_winner_profile_url;
    }

    return tournament;
  };

  const allTournaments = [...tournaments2025, ...tournaments2026].map(transformTournament);

  // Import in batches of 50
  const batchSize = 50;
  let totalImported = 0;
  let totalUpdated = 0;
  const allErrors = [];

  for (let i = 0; i < allTournaments.length; i += batchSize) {
    const batch = allTournaments.slice(i, i + batchSize);
    console.log(`\n📤 Importing batch ${Math.floor(i / batchSize) + 1} (${batch.length} tournaments)...`);

    try {
      const result = await client.mutation(api.tournaments.importTournamentsBatch, {
        tournaments: batch,
      });

      totalImported += result.imported;
      totalUpdated += result.updated;

      if (result.errors && result.errors.length > 0) {
        allErrors.push(...result.errors);
      }

      console.log(`✅ Batch complete: ${result.imported} new, ${result.updated} updated`);
    } catch (error) {
      console.error(`❌ Error importing batch: ${error.message}`);
      allErrors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 IMPORT SUMMARY");
  console.log("=".repeat(60));
  console.log(`✨ New tournaments imported: ${totalImported}`);
  console.log(`🔄 Existing tournaments updated: ${totalUpdated}`);
  console.log(`📝 Total processed: ${allTournaments.length}`);
  console.log(`⚠️  Errors: ${allErrors.length}`);

  if (allErrors.length > 0) {
    console.log("\n❌ ERRORS:");
    allErrors.forEach((err, idx) => {
      console.log(`${idx + 1}. ${err}`);
    });
  }

  console.log("\n✅ Import complete!\n");

  // Show status breakdown
  const completed2025 = tournaments2025.filter(t => t.status === "completed").length;
  const scheduled2025 = tournaments2025.filter(t => t.status === "scheduled").length;
  const completed2026 = tournaments2026.filter(t => t.status === "completed").length;
  const scheduled2026 = tournaments2026.filter(t => t.status === "scheduled").length;

  console.log("📈 STATUS BREAKDOWN:");
  console.log(`2025: ${completed2025} completed, ${scheduled2025} scheduled`);
  console.log(`2026: ${completed2026} completed, ${scheduled2026} scheduled\n`);
}

// Run the import
importTournaments().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});