import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, LucideIcon } from "lucide-react";
import Link from "next/link";

interface FeatureCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  title: string;
  description: string;
  details: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
}

export default function FeatureCard({
  icon: Icon,
  iconColor,
  iconBgColor,
  title,
  description,
  details,
  ctaText,
  ctaLink,
  badge,
}: FeatureCardProps) {
  return (
    <Card className="relative h-full hover:shadow-lg transition-shadow duration-300">
      {badge && (
        <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
          {badge}
        </Badge>
      )}
      <CardHeader className="p-6">
        <div className={`w-14 h-14 ${iconBgColor} rounded-xl flex items-center justify-center mb-4`}>
          <Icon className={`w-7 h-7 ${iconColor}`} />
        </div>
        <CardTitle className="text-xl mb-3">{title}</CardTitle>
        <CardDescription className="text-sm mb-4 leading-relaxed">
          {description}
        </CardDescription>
        <p className="text-xs text-muted-foreground mb-4">{details}</p>
        <Link
          href={ctaLink}
          className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {ctaText}
          <ArrowRight className="ml-1 w-4 h-4" />
        </Link>
      </CardHeader>
    </Card>
  );
}
