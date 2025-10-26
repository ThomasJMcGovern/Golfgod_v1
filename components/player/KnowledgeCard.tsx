/**
 * KnowledgeCard Component
 *
 * Reusable card component for Player Knowledge Hub categories.
 * Mobile-first design with ≥44px touch targets.
 */

import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

const knowledgeCardVariants = cva(
  "group relative flex flex-col gap-2 rounded-lg border p-4 transition-all duration-200 min-h-[110px] sm:min-h-[120px]",
  {
    variants: {
      variant: {
        default:
          "bg-card text-card-foreground hover:border-primary hover:bg-accent/5 active:scale-[0.98]",
        active: "border-primary bg-accent/10",
        disabled: "opacity-50 cursor-not-allowed hover:border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface KnowledgeCardProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof knowledgeCardVariants> {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  disabled?: boolean;
}

const KnowledgeCard = React.forwardRef<HTMLAnchorElement, KnowledgeCardProps>(
  ({ className, variant, icon: Icon, title, description, href, disabled, ...props }, ref) => {
    if (disabled) {
      return (
        <div
          className={cn(knowledgeCardVariants({ variant: "disabled", className }))}
          aria-disabled="true"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-muted flex items-center justify-center">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-1">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(knowledgeCardVariants({ variant, className }))}
        {...props}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center transition-colors group-hover:bg-primary/20 dark:group-hover:bg-primary/30">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
        </div>
      </Link>
    );
  }
);

KnowledgeCard.displayName = "KnowledgeCard";

export { KnowledgeCard, knowledgeCardVariants };
