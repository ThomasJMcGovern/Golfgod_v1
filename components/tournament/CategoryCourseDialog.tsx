/**
 * CategoryCourseDialog Component
 *
 * Modal dialog for selecting a course after clicking a category.
 * Mirrors CategoryPlayerDialog design for consistent UX.
 *
 * User Flow:
 * 1. User clicks "Select a course..." button
 * 2. Dialog opens with command palette search
 * 3. User selects course
 * 4. Triggers onCourseSelect callback
 *
 * Features:
 * - Command palette-style course search using shadcn/ui Command component
 * - Location display for each course
 * - Keyboard navigation (Arrow keys, Enter to select, Escape to close)
 * - Category context in dialog title
 * - Mobile-responsive dialog sizing (min 44px touch targets)
 * - Auto-focus on search input
 * - Fuzzy search across ~54 courses
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

interface CategoryCourseDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Callback to handle dialog open/close state */
  onOpenChange: (open: boolean) => void;
  /** Category display name for dialog title */
  categoryName: string;
  /** Callback triggered when course is selected */
  onCourseSelect: (courseId: Id<"courses">) => void;
}

export default function CategoryCourseDialog({
  open,
  onOpenChange,
  categoryName,
  onCourseSelect,
}: CategoryCourseDialogProps) {
  // Fetch all courses using Convex query
  // Safe to use .collect() - courses table has ~54 records (see .claude/CLAUDE.md)
  const courses = useQuery(api.courses.getAllCourses, {});

  /**
   * Handle course selection from Command component.
   * Triggers the onCourseSelect callback to initiate action and closes dialog.
   */
  const handleCourseSelection = (courseId: string) => {
    onCourseSelect(courseId as Id<"courses">);
    onOpenChange(false); // Close dialog after selection
  };

  // Sort courses alphabetically by name for better UX
  const sortedCourses = courses
    ? [...courses].sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[500px] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg sm:text-xl leading-tight pr-8">
            Select a Course to View {categoryName}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Search for a course to explore{" "}
            {categoryName.toLowerCase()} information
          </DialogDescription>
        </DialogHeader>

        <Command className="border-t">
          <CommandInput
            placeholder="Search for a course..."
            className="h-12"
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>
              {!courses ? "Loading courses..." : "No courses found"}
            </CommandEmpty>
            <CommandGroup>
              {sortedCourses.map((course) => (
                <CommandItem
                  key={course._id}
                  value={`${course.name} ${course.location}`}
                  onSelect={() => handleCourseSelection(course._id)}
                  className="flex flex-col items-start gap-1 py-3 cursor-pointer"
                >
                  <span className="text-sm font-medium">{course.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {course.location}
                  </span>
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
