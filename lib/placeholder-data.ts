/**
 * Placeholder Data Utilities
 *
 * Mock data generators for Player Knowledge Hub categories.
 * This data will be replaced with real Convex queries in future implementation.
 */

export interface PlaceholderProfile {
  personalInfo: {
    birthDate: string;
    birthPlace: string;
    college: string;
    height: string;
    weight: string;
    swing: "Right" | "Left";
    turnedPro: number;
  };
  background: {
    earlyLife: string;
    golfStart: string;
    achievements: string;
  };
}

export interface PlaceholderFamily {
  maritalStatus: "Single" | "Married" | "Divorced";
  spouse?: {
    name: string;
    since: number;
  };
  children?: Array<{
    name: string;
    age: number;
  }>;
}

export interface PlaceholderFamilyHistory {
  members: Array<{
    name: string;
    relationship: string;
    golfLevel: "College" | "Professional" | "Amateur";
    achievements: string;
  }>;
}

export interface PlaceholderProfessional {
  status: "PGA Tour" | "Korn Ferry" | "Retired";
  tourCard: number; // Year
  careerMilestones: Array<{
    year: number;
    achievement: string;
  }>;
}

export interface PlaceholderCourse {
  name: string;
  location: string;
  distance: number; // miles
  tournaments?: string[];
  performance?: {
    events: number;
    avgScore: number;
  };
}

export interface PlaceholderInjury {
  type: string;
  affectedArea: string;
  date: string;
  status: "Active" | "Recovering" | "Recovered";
  recoveryTimeline?: string;
  impact?: string;
}

export interface PlaceholderIntangible {
  category: "Weather" | "Course Type" | "Pressure" | "Tournament Size";
  description: string;
  performance: string;
  stats?: string;
}

export const getPlaceholderProfile = (playerId: string): PlaceholderProfile => ({
  personalInfo: {
    birthDate: "1996-06-21",
    birthPlace: "Ridgewood, New Jersey",
    college: "University of Texas",
    height: "6'3\"",
    weight: "215 lbs",
    swing: "Right",
    turnedPro: 2018,
  },
  background: {
    earlyLife: "Grew up in a golf-loving family in New Jersey...",
    golfStart: "Started playing golf at age 3...",
    achievements: "Won multiple junior championships...",
  },
});

export const getPlaceholderFamily = (playerId: string): PlaceholderFamily => ({
  maritalStatus: "Married",
  spouse: {
    name: "Meredith Scudder",
    since: 2020,
  },
  children: [
    { name: "Bennett", age: 1 },
  ],
});

export const getPlaceholderFamilyHistory = (playerId: string): PlaceholderFamilyHistory => ({
  members: [
    {
      name: "Father",
      relationship: "Father",
      golfLevel: "Amateur",
      achievements: "Club champion, introduced son to golf",
    },
  ],
});

export const getPlaceholderProfessional = (playerId: string): PlaceholderProfessional => ({
  status: "PGA Tour",
  tourCard: 2020,
  careerMilestones: [
    { year: 2022, achievement: "Masters Champion" },
    { year: 2024, achievement: "THE PLAYERS Champion" },
  ],
});

export const getPlaceholderHometownCourses = (playerId: string): PlaceholderCourse[] => [
  {
    name: "Baltusrol Golf Club",
    location: "Springfield, NJ",
    distance: 15,
    tournaments: ["PGA Championship (past)"],
    performance: { events: 1, avgScore: 71.2 },
  },
  {
    name: "Liberty National Golf Club",
    location: "Jersey City, NJ",
    distance: 25,
    tournaments: ["The Northern Trust (past)"],
    performance: { events: 3, avgScore: 69.8 },
  },
  {
    name: "Ridgewood Country Club",
    location: "Ridgewood, NJ",
    distance: 2,
  },
];

export const getPlaceholderUniversityCourses = (playerId: string): PlaceholderCourse[] => [
  {
    name: "TPC San Antonio",
    location: "San Antonio, TX",
    distance: 75,
    tournaments: ["Valero Texas Open"],
    performance: { events: 4, avgScore: 68.5 },
  },
  {
    name: "Colonial Country Club",
    location: "Fort Worth, TX",
    distance: 180,
    tournaments: ["Charles Schwab Challenge"],
    performance: { events: 5, avgScore: 69.2 },
  },
];

export const getPlaceholderInjuries = (playerId: string): PlaceholderInjury[] => [
  {
    type: "Minor neck strain",
    affectedArea: "Neck",
    date: "2023-08-15",
    status: "Recovered",
    recoveryTimeline: "2 weeks",
    impact: "Missed 1 tournament",
  },
];

export const getPlaceholderIntangibles = (playerId: string): PlaceholderIntangible[] => [
  {
    category: "Weather",
    description: "Performs better in calm conditions",
    performance: "Strong",
    stats: "Avg score: 68.5 (calm) vs 70.2 (windy)",
  },
  {
    category: "Course Type",
    description: "Excels on parkland-style courses",
    performance: "Excellent",
    stats: "5 wins on parkland courses",
  },
  {
    category: "Pressure",
    description: "Elite performance in major championships",
    performance: "Outstanding",
    stats: "4 major victories",
  },
];
