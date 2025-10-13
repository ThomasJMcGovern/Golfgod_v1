"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import Dashboard from "@/components/layout/Dashboard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Trophy,
  ClipboardList,
  ChevronRight,
  Check,
  Users,
  TrendingUp,
  Heart
} from "lucide-react";
import StatsBar from "@/components/landing/StatsBar";
import FeatureCard from "@/components/landing/FeatureCard";
import HowItWorks from "@/components/landing/HowItWorks";
import ComparisonSection from "@/components/landing/ComparisonSection";
import UseCaseCard from "@/components/landing/UseCaseCard";
import Link from "next/link";

export default function Home() {
  const { signIn } = useAuthActions();
  const [isSignInMode, setIsSignInMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn("password", {
        email,
        password,
        flow: isSignInMode ? "signIn" : "signUp",
      });
      setDialogOpen(false);
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Unauthenticated>
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
          {/* Header */}
          <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-14 sm:h-16">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-primary">GolfGod</h1>
                  <span className="hidden sm:inline ml-2 text-xs sm:text-sm text-muted-foreground">
                    PGA Tour Analytics
                  </span>
                </div>
                <Button
                  onClick={() => setDialogOpen(true)}
                  size="sm"
                  className="sm:size-default"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </header>

          <main className="pt-14 sm:pt-16">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32">
              <div className="text-center max-w-4xl mx-auto">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                  GolfGod
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl text-foreground mb-6 sm:mb-8 leading-relaxed">
                  The must have tool for discerning golf enthusiasts! GolfGod can turn the guessing game
                  into more likely winning picks in minutes. Whether deciding on one golfers chances, or trying
                  to fill a roster of 4/6 golfers in your fantasy league, GolfGod, makes you the expert!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto text-base sm:text-lg px-8 py-6"
                    onClick={() => setDialogOpen(true)}
                  >
                    Get Started Free
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto text-base sm:text-lg px-8 py-6"
                    onClick={scrollToHowItWorks}
                  >
                    See How It Works
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  Join 1,000+ golf enthusiasts making smarter picks
                </p>
              </div>
            </section>

            {/* Stats Bar */}
            <StatsBar />

            {/* Three Feature Cards */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <FeatureCard
                  icon={User}
                  iconColor="text-blue-600 dark:text-blue-400"
                  iconBgColor="bg-blue-100 dark:bg-blue-900/20"
                  title="THE PLAYERS"
                  description="GolfGod provides the most comprehensive overview of player history, statistics and insight providing you with an unparalleled edge, versus your colleagues and competitors, worldwide!"
                  details="200+ PGA Tour players tracked"
                  ctaText="Browse Players"
                  ctaLink="/players"
                />
                <FeatureCard
                  icon={Trophy}
                  iconColor="text-purple-600 dark:text-purple-400"
                  iconBgColor="bg-purple-100 dark:bg-purple-900/20"
                  title="TOURNAMENTS / TOURS"
                  description="GolfGod's tournament information history, statistics and analytics, for multiple tours, gives you the ability to uniquely assess your player picks in the most effective and intelligent way known to golf!"
                  details="20,745+ tournament results from 2015-2026"
                  ctaText="View Tournaments"
                  ctaLink="/tournaments"
                />
                <FeatureCard
                  icon={ClipboardList}
                  iconColor="text-orange-600 dark:text-orange-400"
                  iconBgColor="bg-orange-100 dark:bg-orange-900/20"
                  title="INSIDE THE ROPES"
                  description="GolfGod provides the most comprehensive overview of player history, statistics and insight providing you with an unparalleled edge, versus your colleagues and competitors, worldwide!"
                  details="54 courses analyzed with career-specific stats"
                  ctaText="Try Inside the Ropes"
                  ctaLink="/inside-the-ropes"
                  badge="NEW"
                />
              </div>
            </section>

            {/* What Can GolfGod Do For You? */}
            <section className="w-full bg-secondary/30 py-16 sm:py-24">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 sm:mb-16">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                    What can GolfGod do for you?
                  </h2>
                  <p className="text-lg sm:text-xl text-muted-foreground">
                    Professional golf is unique due to ever-changing locations, climate, grass and seasons!
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                  <div className="space-y-4">
                    {[
                      "Instead of trying to guess or just look at \"the odds\", GolfGod, gives you detailed insight on a players intangibles.",
                      "Rather than attempting to cross-reference 10-30 or more statistical data points, GolfGod, does it for you.",
                      "Ever wonder about the historical \"nature\" of a players ups 'n downs? Well, GolfGod, can answer that for you too!",
                      "How about the Majors? Even past Ryder Cup locations? Knowing how a player performed is everything.",
                      "Making player picks no longer needs to be a complete guessing game or half-baked with GolfGod on your side.",
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-background rounded-lg">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm sm:text-base">{benefit}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-background rounded-xl p-8 border border-border">
                    <h3 className="text-xl font-semibold mb-4">Inside the Ropes Example</h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex justify-between py-2 border-b border-border">
                        <span>Scoring Average:</span>
                        <span className="font-semibold text-foreground">69.8</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span>Rounds Played:</span>
                        <span className="font-semibold text-foreground">24</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span>Best Round:</span>
                        <span className="font-semibold text-foreground">64</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span>Cuts Made:</span>
                        <span className="font-semibold text-foreground">6/6</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span>Wins:</span>
                        <span className="font-semibold text-foreground">2</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span>Total Earnings:</span>
                        <span className="font-semibold text-foreground">$8,450,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How It Works */}
            <div id="how-it-works">
              <HowItWorks />
            </div>

            {/* Use Cases */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Who is GolfGod For?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Whether you're competing or just having fun
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <UseCaseCard
                  icon={Users}
                  iconColor="text-blue-600 dark:text-blue-400"
                  iconBgColor="bg-blue-100 dark:bg-blue-900/20"
                  title="Fantasy League Players"
                  description="Build winning rosters with course-specific data and historical performance insights"
                />
                <UseCaseCard
                  icon={TrendingUp}
                  iconColor="text-green-600 dark:text-green-400"
                  iconBgColor="bg-green-100 dark:bg-green-900/20"
                  title="Serious Bettors"
                  description="Make data-driven picks backed by comprehensive analytics and player intangibles"
                />
                <UseCaseCard
                  icon={Heart}
                  iconColor="text-red-600 dark:text-red-400"
                  iconBgColor="bg-red-100 dark:bg-red-900/20"
                  title="Golf Enthusiasts"
                  description="Deepen your knowledge of players, courses, and tournament history"
                />
              </div>
            </section>

            {/* Comparison Section */}
            <ComparisonSection />

            {/* Final CTA */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 sm:p-12 text-center border border-primary/20">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 leading-tight">
                  Whether you&apos;re serious about making money with your golf picks<br className="hidden sm:block" />
                  or just wanna beat your buddies, GolfGod, is the answer!
                </h2>
                <Button
                  size="lg"
                  className="text-lg px-10 py-6"
                  onClick={() => setDialogOpen(true)}
                >
                  Start Making Smarter Picks
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="mt-4 text-sm text-muted-foreground">
                  No credit card required • Free to get started
                </p>
              </div>
            </section>

            {/* Footer */}
            <footer className="bg-secondary/40 border-t border-border py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                  <div>
                    <h3 className="font-semibold mb-3">Features</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li><Link href="/players" className="hover:text-foreground transition-colors">Players</Link></li>
                      <li><Link href="/tournaments" className="hover:text-foreground transition-colors">Tournaments</Link></li>
                      <li><Link href="/inside-the-ropes" className="hover:text-foreground transition-colors">Inside the Ropes</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Company</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                      <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                      <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Legal</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                      <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Connect</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li><a href="#" className="hover:text-foreground transition-colors">Twitter</a></li>
                      <li><a href="#" className="hover:text-foreground transition-colors">Instagram</a></li>
                    </ul>
                  </div>
                </div>
                <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
                  <p>&copy; 2025 GolfGod. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </main>

          {/* Sign In Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {isSignInMode ? 'Sign In' : 'Sign Up'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : (isSignInMode ? 'Sign In' : 'Sign Up')}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => setIsSignInMode(!isSignInMode)}
                  className="text-sm"
                >
                  {isSignInMode ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Unauthenticated>

      <Authenticated>
        <Dashboard />
      </Authenticated>
    </>
  );
}
