/**
 * Course Categories Configuration
 *
 * Shared constant defining the 6 Tournament Course Information categories.
 * Used by TournamentCourseExplorer and course category pages.
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
  Info,
  FileText,
  Leaf,
  Trophy,
  Medal,
  Star,
} from "lucide-react";

/**
 * Course category configuration interface
 */
export interface CourseCategory {
  /** URL-safe category identifier */
  id: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Display title */
  title: string;
  /** Brief description of category content */
  description: string;
  /** Function to generate category URL for a given course ID and year */
  href: (year: number, courseId: string) => string;
}

/**
 * Tournament Course Information Categories (6 total)
 *
 * Defines all available course information categories for tournament pages.
 * Categories are displayed as interactive cards in TournamentCourseExplorer.
 */
export const courseCategories: CourseCategory[] = [
  {
    id: "info",
    icon: Info,
    title: "Course Information",
    description: "Inception year, architect, and total length",
    href: (year: number, courseId: string) => `/tournaments/pga/${year}/course/${courseId}/info`,
  },
  {
    id: "scorecard",
    icon: FileText,
    title: "Course Scorecard",
    description: "Par breakdown and yardage by hole",
    href: (year: number, courseId: string) => `/tournaments/pga/${year}/course/${courseId}/scorecard`,
  },
  {
    id: "conditions",
    icon: Leaf,
    title: "Course Conditions",
    description: "Grass types, green size, and bunker sand",
    href: (year: number, courseId: string) => `/tournaments/pga/${year}/course/${courseId}/conditions`,
  },
  {
    id: "winners",
    icon: Trophy,
    title: "Winners Since 2015",
    description: "Historical winners with scores and earnings",
    href: (year: number, courseId: string) => `/tournaments/pga/${year}/course/${courseId}/winners`,
  },
  {
    id: "top-finishers",
    icon: Medal,
    title: "Top Finishers",
    description: "View top 10, 15, or 20 finishers by year",
    href: (year: number, courseId: string) => `/tournaments/pga/${year}/course/${courseId}/top-finishers`,
  },
  {
    id: "majors",
    icon: Star,
    title: "Major Championships",
    description: "Major tournaments hosted at this course",
    href: (year: number, courseId: string) => `/tournaments/pga/${year}/course/${courseId}/majors`,
  },
];
