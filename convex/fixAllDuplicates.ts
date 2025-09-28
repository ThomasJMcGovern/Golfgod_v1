import { mutation } from "./_generated/server";

export const fixAllDuplicates = mutation({
  handler: async (ctx) => {
    const results = [];

    // JT Poston
    const jtPoston = await ctx.db
      .query("players")
      .filter(q => q.eq(q.field("name"), "J.T. Poston"))
      .first();
    if (jtPoston && !jtPoston.photoUrl) {
      await ctx.db.patch(jtPoston._id, {
        photoUrl: "https://a.espncdn.com/i/headshots/golf/players/full/10505.png"
      });
      results.push("Fixed J.T. Poston");
    }

    // Ludvig Åberg
    const ludvig = await ctx.db
      .query("players")
      .filter(q => q.eq(q.field("name"), "Ludvig Åberg"))
      .first();
    if (ludvig && !ludvig.photoUrl) {
      await ctx.db.patch(ludvig._id, {
        photoUrl: "https://a.espncdn.com/i/headshots/golf/players/full/4375972.png"
      });
      results.push("Fixed Ludvig Åberg");
    }

    // Rasmus Neergaard-Petersen
    const rasmus = await ctx.db
      .query("players")
      .filter(q => q.eq(q.field("name"), "Rasmus Neergaard-Petersen"))
      .first();
    if (rasmus && !rasmus.photoUrl) {
      await ctx.db.patch(rasmus._id, {
        photoUrl: "https://a.espncdn.com/i/headshots/golf/players/full/4858859.png"
      });
      results.push("Fixed Rasmus Neergaard-Petersen");
    }

    return {
      message: "Fixed all duplicate player photos",
      results
    };
  },
});