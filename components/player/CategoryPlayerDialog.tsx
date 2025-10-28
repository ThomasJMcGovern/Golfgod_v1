/**
 * CategoryPlayerDialog Component
 *
 * Modal dialog for selecting a player after clicking a knowledge category.
 * Used in category-first navigation flow:
 * 1. User clicks category card
 * 2. Dialog opens with command palette search
 * 3. User selects player
 * 4. Redirects to /players/{playerId}/{categoryId}
 *
 * Features:
 * - Command palette-style player search using shadcn/ui Command component
 * - Country flag display for each player
 * - Keyboard navigation (Arrow keys, Enter to select, Escape to close)
 * - Category context in dialog title
 * - Mobile-responsive dialog sizing (min 44px touch targets)
 * - Auto-focus on search input
 * - Fuzzy search across ~200 players
 */

"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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

/**
 * Helper function to get flag emoji from country code.
 * Handles special cases for UK subdivisions and invalid codes.
 */
function getFlagEmoji(countryCode: string): string {
  // Handle special cases for UK subdivisions - use UK flag for all
  if (
    countryCode === "GB-ENG" ||
    countryCode === "GB-SCT" ||
    countryCode === "GB-NIR" ||
    countryCode === "GB-WLS"
  ) {
    return "🇬🇧"; // UK flag for all British subdivisions
  }

  // Handle invalid or empty country codes
  if (!countryCode || countryCode.length !== 2) {
    return "🏳️"; // Default flag
  }

  try {
    // Convert country code to flag emoji
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🏳️"; // Default flag on error
  }
}

export default function CategoryPlayerDialog({
  open,
  onOpenChange,
  categoryName,
  onPlayerSelect,
}: CategoryPlayerDialogProps) {
  // Fetch all players using Convex query
  // Safe to use .collect() - players table has ~200 records (see .claude/CLAUDE.md)
  const players = useQuery(api.players.getAll, {});

  /**
   * Handle player selection from Command component.
   * Triggers the onPlayerSelect callback to initiate redirect and closes dialog.
   */
  const handlePlayerSelection = (playerId: string) => {
    onPlayerSelect(playerId as Id<"players">);
    onOpenChange(false); // Close dialog after selection
  };

  // Sort players alphabetically by name for better UX
  const sortedPlayers = players
    ? [...players].sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[500px] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg sm:text-xl leading-tight pr-8">
            Select a Player to View {categoryName}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Search for a player to explore their{" "}
            {categoryName.toLowerCase()} information
          </DialogDescription>
        </DialogHeader>

        <Command className="border-t">
          <CommandInput
            placeholder="Search for a player..."
            className="h-12"
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>
              {!players ? "Loading players..." : "No players found"}
            </CommandEmpty>
            <CommandGroup>
              {sortedPlayers.map((player) => (
                <CommandItem
                  key={player._id}
                  value={`${player.name} ${player.country}`}
                  onSelect={() => handlePlayerSelection(player._id)}
                  className="flex items-center gap-2 py-3 cursor-pointer"
                >
                  <span className="text-base opacity-70">
                    {getFlagEmoji(player.countryCode)}
                  </span>
                  <span className="text-sm">{player.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>

        <div className="px-6 pb-6 pt-2">
          <p className="text-xs text-muted-foreground">
            Tip: Use arrow keys to navigate, Enter to select, Esc to close
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
