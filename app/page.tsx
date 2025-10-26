"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Trophy,
  ClipboardList,
  ChevronRight
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import FeatureCard from "@/components/landing/FeatureCard";
import UserMenu from "@/components/layout/UserMenu";
import MainNavigation from "@/components/layout/MainNavigation";
import { ModeToggle } from "@/components/mode-toggle";
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

  // Shared header component
  const LandingPageHeader = () => (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-primary">GolfGod</h1>
            <span className="hidden sm:inline ml-2 text-xs sm:text-sm text-muted-foreground">
              PGA Tour Analytics
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Unauthenticated>
              <Button
                onClick={() => setDialogOpen(true)}
                size="sm"
                className="sm:size-default"
              >
                Sign In
              </Button>
            </Unauthenticated>
            <Authenticated>
              <ModeToggle />
              <UserMenu />
            </Authenticated>
          </div>
        </div>
      </div>
    </header>
  );

  return (
    <>
      <Unauthenticated>
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
          {/* Header */}
          <LandingPageHeader />

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

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto text-base sm:text-lg px-8 py-6"
                    onClick={() => setDialogOpen(true)}
                  >
                    Get Started Free
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </section>

            {/* Three Feature Cards */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <FeatureCard
                  icon={User}
                  iconColor="text-blue-600 dark:text-blue-400"
                  iconBgColor="bg-blue-100 dark:bg-blue-900/20"
                  title="THE PLAYERS"
                  description="GolfGod provides the most comprehensive overview of player history, statistics and insight providing you with an unparalleled edge, versus your colleagues and competitors, worldwide!"
                  ctaText="Browse Players"
                  ctaLink="/players"
                />
                <FeatureCard
                  icon={Trophy}
                  iconColor="text-purple-600 dark:text-purple-400"
                  iconBgColor="bg-purple-100 dark:bg-purple-900/20"
                  title="TOURNAMENTS / TOURS"
                  description="GolfGod's tournament information history, statistics and analytics, for multiple tours, gives you the ability to uniquely assess your player picks in the most effective and intelligent way known to golf!"
                  ctaText="View Tournaments"
                  ctaLink="/tournaments"
                />
                <FeatureCard
                  icon={ClipboardList}
                  iconColor="text-orange-600 dark:text-orange-400"
                  iconBgColor="bg-orange-100 dark:bg-orange-900/20"
                  title="INSIDE THE ROPES"
                  description="GolfGod provides the most comprehensive overview of player history, statistics and insight providing you with an unparalleled edge, versus your colleagues and competitors, worldwide!"
                  ctaText="Try Inside the Ropes"
                  ctaLink="/inside-the-ropes"
                />
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
          <AnimatePresence mode="wait">
            {dialogOpen && (
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
            )}
          </AnimatePresence>
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
          {/* Header */}
          <LandingPageHeader />

          {/* Main Navigation */}
          <div className="pt-14 sm:pt-16">
            <MainNavigation />
          </div>

          <main>
            {/* Hero Section - Modified for authenticated users */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32">
              <div className="text-center max-w-4xl mx-auto">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                  Welcome to GolfGod
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl text-foreground mb-6 sm:mb-8 leading-relaxed">
                  What would you like to explore today?
                </p>
              </div>
            </section>

            {/* Three Feature Cards - NOW CLICKABLE */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <FeatureCard
                  icon={User}
                  iconColor="text-blue-600 dark:text-blue-400"
                  iconBgColor="bg-blue-100 dark:bg-blue-900/20"
                  title="THE PLAYERS"
                  description="GolfGod provides the most comprehensive overview of player history, statistics and insight providing you with an unparalleled edge, versus your colleagues and competitors, worldwide!"
                  ctaText="Browse Players"
                  ctaLink="/players"
                  isClickable={true}
                />
                <FeatureCard
                  icon={Trophy}
                  iconColor="text-purple-600 dark:text-purple-400"
                  iconBgColor="bg-purple-100 dark:bg-purple-900/20"
                  title="TOURNAMENTS / TOURS"
                  description="GolfGod's tournament information history, statistics and analytics, for multiple tours, gives you the ability to uniquely assess your player picks in the most effective and intelligent way known to golf!"
                  ctaText="View Tournaments"
                  ctaLink="/tournaments"
                  isClickable={true}
                />
                <FeatureCard
                  icon={ClipboardList}
                  iconColor="text-orange-600 dark:text-orange-400"
                  iconBgColor="bg-orange-100 dark:bg-orange-900/20"
                  title="INSIDE THE ROPES"
                  description="GolfGod provides the most comprehensive overview of player history, statistics and insight providing you with an unparalleled edge, versus your colleagues and competitors, worldwide!"
                  ctaText="Try Inside the Ropes"
                  ctaLink="/inside-the-ropes"
                  isClickable={true}
                />
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
        </div>
      </Authenticated>
    </>
  );
}
