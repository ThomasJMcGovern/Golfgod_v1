/**
 * PlayerKnowledgeHub Component
 *
 * Main knowledge hub component with 8 category cards.
 * Mobile-first responsive grid layout.
 */

"use client";

import { Id } from "@/convex/_generated/dataModel";
import { KnowledgeCard } from "./KnowledgeCard";
import {
  User,
  Users,
  Trophy,
  Briefcase,
  Home,
  GraduationCap,
  Activity,
  Brain,
} from "lucide-react";

interface PlayerKnowledgeHubProps {
  playerId: Id<"players"> | null;
}

const knowledgeCategories = [
  {
    id: "profile",
    icon: User,
    title: "Personal Profile",
    description: "Physical stats, background, and personal information",
    href: (playerId: string) => `/players/${playerId}/profile`,
  },
  {
    id: "family",
    icon: Users,
    title: "Family",
    description: "Personal family information and relationships",
    href: (playerId: string) => `/players/${playerId}/family`,
  },
  {
    id: "family-history",
    icon: Trophy,
    title: "Family Golf History",
    description: "Family members with college or professional golf background",
    href: (playerId: string) => `/players/${playerId}/family-history`,
  },
  {
    id: "professional",
    icon: Briefcase,
    title: "Professional History",
    description: "Career timeline, achievements, and current status",
    href: (playerId: string) => `/players/${playerId}/professional`,
  },
  {
    id: "hometown-courses",
    icon: Home,
    title: "Hometown Courses",
    description: "Tour courses within 180 miles of hometown",
    href: (playerId: string) => `/players/${playerId}/hometown-courses`,
  },
  {
    id: "university-courses",
    icon: GraduationCap,
    title: "University Courses",
    description: "Tour courses within 180 miles of university",
    href: (playerId: string) => `/players/${playerId}/university-courses`,
  },
  {
    id: "injuries",
    icon: Activity,
    title: "Injury History",
    description: "Past injuries, recovery timelines, and current status",
    href: (playerId: string) => `/players/${playerId}/injuries`,
  },
  {
    id: "intangibles",
    icon: Brain,
    title: "Intangibles",
    description: "Weather preferences, course tendencies, and pressure situations",
    href: (playerId: string) => `/players/${playerId}/intangibles`,
  },
];

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
