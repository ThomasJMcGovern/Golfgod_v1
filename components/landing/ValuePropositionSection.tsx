import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

/**
 * ValuePropositionSection Component
 *
 * Displays the "What can GolfGod do for you?" section on the landing page.
 * Highlights the unique value proposition and key benefits of the GolfGod platform.
 *
 * Features:
 * - Prominent headline with gradient styling
 * - Subheading explaining golf's unique challenges
 * - Five key benefit points with checkmark icons
 * - Conversion-focused closing statement
 * - Fully responsive design (mobile-first)
 * - Dark mode support via CSS variables
 */

export interface ValuePropositionSectionProps
  extends React.HTMLAttributes<HTMLElement> {
  /**
   * Optional additional CSS classes
   */
  className?: string;
}

const ValuePropositionSection = React.forwardRef<
  HTMLElement,
  ValuePropositionSectionProps
>(({ className, ...props }, ref) => {
  const benefits = [
    "Instead of trying to guess or just look at \"the odds\", GolfGod gives you detailed insight on a player's intangibles.",
    "Rather than attempting to cross-reference 10-30 or more statistical data points, GolfGod does it for you.",
    "Ever wonder about the historical \"nature\" of a player's ups 'n downs? Well, GolfGod can answer that for you too!",
    "How about the Majors? Even past Ryder Cup locations? Knowing how a player performed is everything.",
    "Making player picks no longer needs to be a complete guessing game or half-baked with GolfGod on your side.",
  ];

  return (
    <section
      ref={ref}
      className={cn(
        "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24",
        className
      )}
      aria-labelledby="value-proposition-heading"
      {...props}
    >
      {/* Content Container */}
      <div className="max-w-4xl mx-auto">
        {/* Headline */}
        <h2
          id="value-proposition-heading"
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 sm:mb-8 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent"
        >
          What can GolfGod do for you?
        </h2>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-center text-foreground mb-8 sm:mb-12 leading-relaxed">
          Professional golf is unique due to ever-changing locations, climate,
          grass and seasons!
        </p>

        {/* Benefits List */}
        <ul className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-3 sm:gap-4">
              {/* Checkmark Icon */}
              <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              {/* Benefit Text */}
              <p className="text-base sm:text-lg text-foreground leading-relaxed flex-1">
                {benefit}
              </p>
            </li>
          ))}
        </ul>

        {/* Closing Statement */}
        <div className="text-center">
          <p className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground leading-relaxed">
            Whether you&apos;re serious about making money with your golf picks
            or just wanna beat your buddies,{" "}
            <span className="text-primary">GolfGod</span> is the answer!
          </p>
        </div>
      </div>
    </section>
  );
});

ValuePropositionSection.displayName = "ValuePropositionSection";

export default ValuePropositionSection;
