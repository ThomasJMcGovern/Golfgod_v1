/**
 * Knowledge Hub Categories Configuration
 *
 * Shared constant defining the 8 Player Knowledge Hub categories.
 * Used by both PlayerKnowledgeHub and CategoryExplorer components.
 *
 * Single source of truth for category metadata including:
 * - Category ID (URL-safe identifier)
 * - Icon component (Lucide React)
 * - Display title
 * - Description text
 * - URL generator function
 */

import { LucideIcon } from "lucide-react";
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

/**
 * Knowledge category configuration interface
 */
export interface KnowledgeCategory {
  /** URL-safe category identifier */
  id: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Display title */
  title: string;
  /** Brief description of category content */
  description: string;
  /** Function to generate category URL for a given player ID */
  href: (playerId: string) => string;
}

/**
 * Player Knowledge Hub Categories (8 total)
 *
 * Defines all available knowledge categories for player profiles.
 * Categories are displayed as interactive cards in both:
 * - PlayerKnowledgeHub (player-first navigation)
 * - CategoryExplorer (category-first navigation)
 */
export const knowledgeCategories: KnowledgeCategory[] = [
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
