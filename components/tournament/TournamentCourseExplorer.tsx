/**
 * TournamentCourseExplorer Component
 *
 * Category-first navigation interface for Tournament Course Explorer.
 * Displays 6 course category cards that open course selection dialog.
 *
 * User Flow:
 * 1. User clicks on a category card (e.g., "Course Information")
 * 2. Dialog opens prompting course selection
 * 3. User searches/selects a course
 * 4. Automatically redirects to /tournaments/pga/{year}/course/{courseId}/{category}
 *
 * Features:
 * - Category-first navigation pattern (matches Player Knowledge Hub)
 * - Command palette-style course selection dialog
 * - 6 responsive category cards
 * - Mobile-first design with ≥44px touch targets
 * - Dark mode support
 * - Keyboard navigation
 * - Reuses KnowledgeCard component for visual consistency
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { courseCategories } from "@/lib/course-categories";
import { KnowledgeCard } from "@/components/player/KnowledgeCard";
import CategoryCourseDialog from "./CategoryCourseDialog";

interface TournamentCourseExplorerProps {
  year: number;
}

export default function TournamentCourseExplorer({
  year,
}: TournamentCourseExplorerProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  /**
   * Handle category card click.
   * Opens course selection dialog for the clicked category.
   */
  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setDialogOpen(true);
  };

  /**
   * Handle course selection from dialog.
   * Redirects to the category page for the selected course.
   */
  const handleCourseSelect = (courseId: Id<"courses">) => {
    if (selectedCategory) {
      // Close dialog
      setDialogOpen(false);

      // Redirect to category page for selected course
      router.push(`/tournaments/pga/${year}/course/${courseId}/${selectedCategory}`);

      // Reset state
      setSelectedCategory(null);
    }
  };

  /**
   * Handle dialog close without selection.
   * Resets state and returns to tournament page.
   */
  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedCategory(null);
    }
  };

  // Get selected category data for dialog
  const selectedCategoryData = selectedCategory
    ? courseCategories.find((cat) => cat.id === selectedCategory)
    : null;

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

      {/* Course selection dialog */}
      {selectedCategoryData && (
        <CategoryCourseDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          categoryName={selectedCategoryData.title}
          onCourseSelect={handleCourseSelect}
        />
      )}
    </div>
  );
}
