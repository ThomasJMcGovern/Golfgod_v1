/**
 * CategoryExplorer Component
 *
 * Category-first navigation interface for Player Knowledge Hub.
 * Displays 8 knowledge category cards that open player selection dialog.
 *
 * User Flow:
 * 1. User clicks on a category card (e.g., "Injuries")
 * 2. Dialog opens prompting player selection
 * 3. User searches/selects a player
 * 4. Automatically redirects to /players/{playerId}/{categoryId}
 *
 * Features:
 * - Responsive grid layout (1/2/3 columns)
 * - Mobile-first design with ≥44px touch targets
 * - Dark mode support
 * - Keyboard navigation
 * - Reuses KnowledgeCard component for visual consistency
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { knowledgeCategories } from "@/lib/knowledge-categories";
import { KnowledgeCard } from "./KnowledgeCard";
import CategoryPlayerDialog from "./CategoryPlayerDialog";

export default function CategoryExplorer() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  /**
   * Handle category card click.
   * Opens player selection dialog for the clicked category.
   */
  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setDialogOpen(true);
  };

  /**
   * Handle player selection from dialog.
   * Redirects to the category page for the selected player.
   */
  const handlePlayerSelect = (playerId: Id<"players">) => {
    if (selectedCategory) {
      // Close dialog
      setDialogOpen(false);

      // Redirect to category page for selected player
      router.push(`/players/${playerId}/${selectedCategory}`);

      // Reset state
      setSelectedCategory(null);
    }
  };

  /**
   * Handle dialog close without selection.
   * Resets state and returns to /players page.
   */
  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedCategory(null);
    }
  };

  // Get selected category data for dialog
  const selectedCategoryData = selectedCategory
    ? knowledgeCategories.find((cat) => cat.id === selectedCategory)
    : null;

  return (
    <div className="bg-card rounded-lg shadow p-4 sm:p-6 mb-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
          What Would You Like to Know?
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Explore comprehensive player insights across multiple categories
        </p>
      </div>

      {/* Category cards grid - mobile-first responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {knowledgeCategories.map((category) => (
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

      {/* Player selection dialog */}
      {selectedCategoryData && (
        <CategoryPlayerDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          categoryName={selectedCategoryData.title}
          onPlayerSelect={handlePlayerSelect}
        />
      )}
    </div>
  );
}
