import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Import tournament data in batches
export const importTournamentsBatch = mutation({
  args: {
    tournaments: v.array(v.object({
      tournament_id: v.string(),
      name: v.string(),
      year: v.number(),
      dates_raw: v.optional(v.string()),
      start_date: v.optional(v.string()),
      end_date: v.optional(v.string()),
      winner_name: v.optional(v.string()),
      winner_espn_id: v.optional(v.number()),
      winner_profile_url: v.optional(v.string()),
      winning_score: v.optional(v.string()),
      prize_money: v.optional(v.number()),
      status: v.string(),
      espn_tournament_id: v.optional(v.string()),
      espn_leaderboard_url: v.optional(v.string()),
      scraped_at: v.string(),
      // Previous winner fields for scheduled tournaments
      previous_winner_name: v.optional(v.string()),
      previous_winner_espn_id: v.optional(v.number()),
      previous_winner_profile_url: v.optional(v.string()),
    }))
  },
  handler: async (ctx, args) => {
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const tournament of args.tournaments) {
      try {
        // Check if tournament already exists
        const existing = await ctx.db
          .query("pgaTournaments")
          .withIndex("by_tournament_id", q => q.eq("tournament_id", tournament.tournament_id))
          .first();

        if (existing) {
          // Update existing tournament
          await ctx.db.patch(existing._id, tournament);
          skipped++;
        } else {
          // Insert new tournament
          await ctx.db.insert("pgaTournaments", tournament);
          imported++;
        }
      } catch (error) {
        errors.push(`Error importing ${tournament.name} (${tournament.year}): ${error}`);
      }
    }

    return {
      imported,
      updated: skipped,
      total: args.tournaments.length,
      errors
    };
  },
});

// Clear all tournament data (for fresh import)
export const clearTournaments = mutation({
  handler: async (ctx) => {
    const tournaments = await ctx.db.query("pgaTournaments").collect();
    let deleted = 0;

    for (const tournament of tournaments) {
      await ctx.db.delete(tournament._id);
      deleted++;
    }

    return { deleted };
  },
});

// Get tournaments by year
export const getTournamentsByYear = query({
  args: { year: v.number() },
  handler: async (ctx, args) => {
    const tournaments = await ctx.db
      .query("pgaTournaments")
      .withIndex("by_year", q => q.eq("year", args.year))
      .collect();

    // Sort by date (assuming format like "Jan 4" or "Oct 23")
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return tournaments.sort((a, b) => {
      const aMonth = a.start_date?.substring(0, 3) || "";
      const bMonth = b.start_date?.substring(0, 3) || "";
      const aMonthIndex = monthOrder.indexOf(aMonth);
      const bMonthIndex = monthOrder.indexOf(bMonth);

      if (aMonthIndex !== bMonthIndex) {
        return aMonthIndex - bMonthIndex;
      }

      // If same month, sort by day
      const aDay = parseInt(a.start_date?.substring(4) || "0");
      const bDay = parseInt(b.start_date?.substring(4) || "0");
      return aDay - bDay;
    });
  },
});

// Get all tournaments won by a specific player
export const getTournamentsByWinner = query({
  args: { winner_espn_id: v.number() },
  handler: async (ctx, args) => {
    const tournaments = await ctx.db
      .query("pgaTournaments")
      .withIndex("by_winner", q => q.eq("winner_espn_id", args.winner_espn_id))
      .collect();

    return tournaments.sort((a, b) => b.year - a.year);
  },
});

// Get recent tournaments (last 10 completed)
export const getRecentTournaments = query({
  handler: async (ctx) => {
    const tournaments = await ctx.db
      .query("pgaTournaments")
      .withIndex("by_status", q => q.eq("status", "completed"))
      .collect();

    // Sort by year and approximate date, get last 10
    return tournaments
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        // Rough date comparison
        return (b.start_date || "").localeCompare(a.start_date || "");
      })
      .slice(0, 10);
  },
});

// Get tournament by ID
export const getTournamentById = query({
  args: { tournament_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pgaTournaments")
      .withIndex("by_tournament_id", q => q.eq("tournament_id", args.tournament_id))
      .first();
  },
});

// Get tournament statistics by year
export const getTournamentStats = query({
  args: { year: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let tournaments;

    if (args.year !== undefined) {
      tournaments = await ctx.db
        .query("pgaTournaments")
        .withIndex("by_year", q => q.eq("year", args.year!))
        .collect();
    } else {
      tournaments = await ctx.db.query("pgaTournaments").collect();
    }

    const stats = {
      totalTournaments: tournaments.length,
      completedTournaments: tournaments.filter(t => t.status === "completed").length,
      scheduledTournaments: tournaments.filter(t => t.status === "scheduled").length,
      totalPrizeMoney: tournaments.reduce((sum, t) => sum + (t.prize_money || 0), 0),
      uniqueWinners: new Set(tournaments.filter(t => t.winner_espn_id).map(t => t.winner_espn_id)).size,
    };

    return stats;
  },
});

// Get all years with tournament data
export const getAvailableYears = query({
  handler: async (ctx) => {
    const tournaments = await ctx.db.query("pgaTournaments").collect();
    const years = [...new Set(tournaments.map(t => t.year))].sort((a, b) => b - a);
    return years;
  },
});

// Get year summary for all years
export const getYearSummaries = query({
  handler: async (ctx) => {
    const tournaments = await ctx.db.query("pgaTournaments").collect();

    const summaryMap = new Map<number, any>();

    tournaments.forEach(t => {
      if (!summaryMap.has(t.year)) {
        summaryMap.set(t.year, {
          year: t.year,
          totalTournaments: 0,
          completedTournaments: 0,
          totalPrizeMoney: 0,
          uniqueWinners: new Set(),
        });
      }

      const summary = summaryMap.get(t.year)!;
      summary.totalTournaments++;

      if (t.status === "completed") {
        summary.completedTournaments++;
        if (t.prize_money) {
          summary.totalPrizeMoney += t.prize_money;
        }
        if (t.winner_espn_id) {
          summary.uniqueWinners.add(t.winner_espn_id);
        }
      }
    });

    // Convert to array and process
    return Array.from(summaryMap.values())
      .map(s => ({
        ...s,
        uniqueWinners: s.uniqueWinners.size,
      }))
      .sort((a, b) => b.year - a.year);
  },
});

// Search tournaments by name
export const searchTournaments = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const allTournaments = await ctx.db.query("pgaTournaments").collect();

    const searchLower = args.searchTerm.toLowerCase();
    const filtered = allTournaments.filter(t =>
      t.name.toLowerCase().includes(searchLower) ||
      t.winner_name?.toLowerCase().includes(searchLower)
    );

    return filtered.sort((a, b) => b.year - a.year);
  },
});

// Fix 2026 tournament data by converting winner to previous_winner and updating status
export const fix2026TournamentData = mutation({
  handler: async (ctx) => {
    const tournaments2026 = await ctx.db
      .query("pgaTournaments")
      .withIndex("by_year", q => q.eq("year", 2026))
      .collect();

    let updated = 0;
    const errors: string[] = [];

    for (const tournament of tournaments2026) {
      try {
        const updates: any = {
          status: "scheduled",
        };

        // Move winner fields to previous_winner fields
        if (tournament.winner_name) {
          updates.previous_winner_name = tournament.winner_name;
          updates.winner_name = undefined;
        }

        if (tournament.winner_espn_id) {
          updates.previous_winner_espn_id = tournament.winner_espn_id;
          updates.winner_espn_id = undefined;
        }

        if (tournament.winner_profile_url) {
          updates.previous_winner_profile_url = tournament.winner_profile_url;
          updates.winner_profile_url = undefined;
        }

        // Remove winning_score for future tournaments
        if (tournament.winning_score) {
          updates.winning_score = undefined;
        }

        await ctx.db.patch(tournament._id, updates);
        updated++;
      } catch (error) {
        errors.push(`Error updating ${tournament.name}: ${error}`);
      }
    }

    return {
      totalTournaments: tournaments2026.length,
      updated,
      errors
    };
  },
});