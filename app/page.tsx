"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Authenticated, Unauthenticated, useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import UserMenu from "@/components/layout/UserMenu";
import { ModeToggle } from "@/components/mode-toggle";
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
import FeatureCard from "@/components/landing/FeatureCard";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { signIn, signOut } = useAuthActions();
  const { isLoading } = useConvexAuth();
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


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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
                </div>

                <p className="text-sm text-muted-foreground">
                  Join 1,000+ golf enthusiasts making smarter picks
                </p>
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

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={loading}
                onClick={() => {
                  setLoading(true);
                  void signIn("google");
                }}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

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
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
          {/* Authenticated Header */}
          <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-14 sm:h-16">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-primary">GolfGod</h1>
                  <span className="hidden sm:inline ml-2 text-xs sm:text-sm text-muted-foreground">
                    PGA Tour Analytics
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ModeToggle />
                  <UserMenu />
                </div>
              </div>
            </div>
          </header>

          <main className="pt-14 sm:pt-16">
            {/* Hero Section - Authenticated */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32">
              <div className="text-center max-w-4xl mx-auto">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                  Welcome back to GolfGod
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl text-foreground mb-6 sm:mb-8 leading-relaxed">
                  Choose where you'd like to explore to make smarter picks and beat your competition!
                </p>
              </div>
            </section>

            {/* Three Feature Cards - Now Clickable */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <div
                  onClick={() => router.push("/players")}
                  className="cursor-pointer transition-transform hover:scale-105"
                >
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
                </div>
                <div
                  onClick={() => router.push("/tournaments")}
                  className="cursor-pointer transition-transform hover:scale-105"
                >
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
                </div>
                <div
                  onClick={() => router.push("/inside-the-ropes")}
                  className="cursor-pointer transition-transform hover:scale-105"
                >
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
