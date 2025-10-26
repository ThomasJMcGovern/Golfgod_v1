/**
 * CategoryPlayerDialog Component
 *
 * Modal dialog for selecting a player after clicking a knowledge category.
 * Used in category-first navigation flow:
 * 1. User clicks category card
 * 2. Dialog opens with player search
 * 3. User selects player
 * 4. Redirects to /players/{playerId}/{categoryId}
 *
 * Features:
 * - Player search/selection via PlayerSelect component
 * - Category context in dialog title
 * - Mobile-responsive dialog sizing
 * - Auto-focus on player search input
 * - Keyboard navigation (Escape to close)
 */

"use client";

import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PlayerSelect from "./PlayerSelect";

interface CategoryPlayerDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Callback to handle dialog open/close state */
  onOpenChange: (open: boolean) => void;
  /** Category display name for dialog title */
  categoryName: string;
  /** Callback triggered when player is selected */
  onPlayerSelect: (playerId: Id<"players">) => void;
}

export default function CategoryPlayerDialog({
  open,
  onOpenChange,
  categoryName,
  onPlayerSelect,
}: CategoryPlayerDialogProps) {
  /**
   * Handle player selection from PlayerSelect component.
   * Triggers the onPlayerSelect callback to initiate redirect.
   */
  const handlePlayerSelection = (playerId: Id<"players"> | null) => {
    if (playerId) {
      onPlayerSelect(playerId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg sm:text-xl leading-tight pr-8">
            Select a Player to View {categoryName}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Search for a player to explore their {categoryName.toLowerCase()} information
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 sm:mt-6">
          <PlayerSelect
            onSelectPlayer={handlePlayerSelection}
            selectedPlayerId={null}
          />
        </div>

        <DialogDescription className="text-xs text-muted-foreground mt-3 sm:mt-4">
          Tip: Start typing a player&apos;s name or country to filter the list
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
