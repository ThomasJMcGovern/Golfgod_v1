"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { User, Trophy, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MainNavigationProps {
  activeSection?: "players" | "tournaments" | "inside-the-ropes";
}

const navigationItems = [
  {
    id: "players" as const,
    label: "Players",
    href: "/players",
    icon: User,
  },
  {
    id: "tournaments" as const,
    label: "Tournaments",
    href: "/tournaments",
    icon: Trophy,
  },
  {
    id: "inside-the-ropes" as const,
    label: "Inside the Ropes",
    href: "/inside-the-ropes",
    icon: ClipboardList,
  },
];

export default function MainNavigation({ activeSection }: MainNavigationProps) {
  const pathname = usePathname();

  // Determine active section from pathname if not explicitly provided
  const getActiveSection = () => {
    if (activeSection) return activeSection;

    if (pathname?.startsWith("/players")) return "players";
    if (pathname?.startsWith("/tournaments")) return "tournaments";
    if (pathname?.startsWith("/inside-the-ropes")) return "inside-the-ropes";

    return null;
  };

  const currentActiveSection = getActiveSection();

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="sticky top-16 z-40 border-b bg-card"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 sm:gap-4 overflow-x-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentActiveSection === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 sm:px-4 py-3 sm:py-4 min-h-[44px] whitespace-nowrap transition-colors",
                  "text-sm font-medium",
                  isActive
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
