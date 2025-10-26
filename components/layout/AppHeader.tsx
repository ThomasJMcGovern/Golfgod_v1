"use client";

import UserMenu from "@/components/layout/UserMenu";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-background border-b">
      <div className="relative flex h-16 items-center justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Title Section */}
        <div className="flex flex-col justify-center">
          <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
          {subtitle && (
            <p className="hidden sm:block text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        {/* UserMenu */}
        <div className="absolute right-4 sm:right-6 lg:right-8 flex items-center">
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
