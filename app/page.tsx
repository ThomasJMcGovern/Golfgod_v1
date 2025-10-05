"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import Dashboard from "@/components/layout/Dashboard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Trophy, BarChart3, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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

  return (
    <>
      <Unauthenticated>
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
          {/* Header */}
          <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-14 sm:h-16">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold">GolfGod</h1>
                  <span className="hidden sm:inline ml-2 text-xs sm:text-sm text-muted-foreground">PGA Tour Analytics</span>
                </div>
                <Button onClick={() => setDialogOpen(true)} size="sm" className="sm:size-default">
                  Sign In
                </Button>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <main className="pt-14 sm:pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32">
              <div className="text-center">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
                  Master Your Golf Analytics
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                  Comprehensive statistical analysis for PGA Tour events. Track players, tournaments, and gain expert insights.
                </p>
                <Button size="default" className="sm:size-lg" onClick={() => setDialogOpen(true)}>
                  Get Started
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="bg-secondary/20 py-12 sm:py-16 md:py-24">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <CardTitle className="text-base sm:text-lg">Player Analytics</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        View detailed profiles, statistics, and tournament history for 156+ active players
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                        <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <CardTitle className="text-base sm:text-lg">Tournament Tracking</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Browse current, completed, and upcoming tournaments with comprehensive data
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                        <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <CardTitle className="text-base sm:text-lg">Expert Insights</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Expert analysis, course insights, and betting strategies to elevate your game
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            </div>
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