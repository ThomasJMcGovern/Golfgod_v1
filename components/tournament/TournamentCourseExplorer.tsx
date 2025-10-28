/**
 * TournamentCourseExplorer Component
 *
 * Course information explorer for tournament pages.
 * Displays "What Would You Like to Know?" section with 6 category cards.
 *
 * User Flow:
 * 1. User selects a course from dropdown
 * 2. User clicks on a category card (e.g., "Course Information")
 * 3. Navigates to /tournaments/pga/{year}/course/{courseId}/{category}
 *
 * Features:
 * - Course selection dropdown
 * - 6 responsive category cards
 * - Mobile-first design with ≥44px touch targets
 * - Dark mode support
 * - Shows message if no course selected
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { courseCategories } from "@/lib/course-categories";
import { KnowledgeCard } from "@/components/player/KnowledgeCard";
import CourseSelect from "./CourseSelect";

interface TournamentCourseExplorerProps {
  year: number;
}

export default function TournamentCourseExplorer({
  year,
}: TournamentCourseExplorerProps) {
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState<Id<"courses"> | null>(null);

  /**
   * Handle category card click.
   * If course is selected, navigate to category page.
   * If no course selected, show message (handled by onclick toast).
   */
  const handleCategoryClick = (categoryId: string) => {
    if (!selectedCourseId) {
      // Show a simple alert for now (can be replaced with toast notification)
      alert("Please select a course first to view this information.");
      return;
    }

    // Navigate to category page
    router.push(`/tournaments/pga/${year}/course/${selectedCourseId}/${categoryId}`);
  };

  return (
    <div className="bg-card rounded-lg shadow p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
          What Would You Like to Know?
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Explore comprehensive course details and historical data
        </p>
      </div>

      {/* Course Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Select a Course
        </label>
        <CourseSelect
          onSelectCourse={setSelectedCourseId}
          selectedCourseId={selectedCourseId}
        />
      </div>

      {/* Category cards grid - mobile-first responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {courseCategories.map((category) => (
          <KnowledgeCard
            key={category.id}
            icon={category.icon}
            title={category.title}
            description={category.description}
            // Use # href to make it a valid link, then prevent default on click
            href="#"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              handleCategoryClick(category.id);
            }}
          />
        ))}
      </div>

      {/* Helper text */}
      {!selectedCourseId && (
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Select a course above to explore detailed course information
        </p>
      )}
    </div>
  );
}
