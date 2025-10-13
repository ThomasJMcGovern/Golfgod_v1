"use client";

import { BarChart3, Trophy, MapPin, Calendar } from "lucide-react";

export default function StatsBar() {
  const stats = [
    {
      icon: BarChart3,
      value: "200+",
      label: "PGA Tour Players",
    },
    {
      icon: Trophy,
      value: "20,745+",
      label: "Tournament Results",
    },
    {
      icon: MapPin,
      value: "54",
      label: "Courses Analyzed",
    },
    {
      icon: Calendar,
      value: "2015-2026",
      label: "Historical Data",
    },
  ];

  return (
    <div className="w-full bg-secondary/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center space-y-2"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
