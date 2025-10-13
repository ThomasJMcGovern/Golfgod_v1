import { X, Check } from "lucide-react";

export default function ComparisonSection() {
  const comparisons = [
    {
      oldWay: "Manual research across 10+ sites",
      newWay: "All data in one place",
    },
    {
      oldWay: 'Guessing based on "the odds"',
      newWay: "Player intangibles & historical trends",
    },
    {
      oldWay: "Generic tournament stats",
      newWay: "Course-specific performance",
    },
    {
      oldWay: "Hours of cross-referencing",
      newWay: "Instant insights in minutes",
    },
  ];

  return (
    <div className="w-full bg-secondary/20 py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            The Old Way vs The GolfGod Way
          </h2>
          <p className="text-lg text-muted-foreground">
            Stop wasting time. Start making smarter picks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Old Way Column */}
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-destructive">Old Way</h3>
            </div>
            {comparisons.map((item, index) => (
              <div
                key={`old-${index}`}
                className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20"
              >
                <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{item.oldWay}</span>
              </div>
            ))}
          </div>

          {/* GolfGod Way Column */}
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-primary">GolfGod Way</h3>
            </div>
            {comparisons.map((item, index) => (
              <div
                key={`new-${index}`}
                className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20"
              >
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">{item.newWay}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
