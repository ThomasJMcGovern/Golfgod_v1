/**
 * PlayerKnowledgeHub Component
 *
 * Main knowledge hub component with 8 category cards.
 * Mobile-first responsive grid layout.
 */

"use client";

import { Id } from "@/convex/_generated/dataModel";
import { KnowledgeCard } from "./KnowledgeCard";
import { knowledgeCategories } from "@/lib/knowledge-categories";

interface PlayerKnowledgeHubProps {
  playerId: Id<"players"> | null;
}

export default function PlayerKnowledgeHub({ playerId }: PlayerKnowledgeHubProps) {
  if (!playerId) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg shadow p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
          What Would You Like to Know?
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Explore comprehensive player insights across multiple categories
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {knowledgeCategories.map((category) => (
          <KnowledgeCard
            key={category.id}
            icon={category.icon}
            title={category.title}
            description={category.description}
            href={category.href(playerId)}
          />
        ))}
      </div>
    </div>
  );
}
