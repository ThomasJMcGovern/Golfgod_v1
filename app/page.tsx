"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import Dashboard from "@/components/Dashboard";
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
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold">GolfGod</h1>
                  <span className="ml-2 text-sm text-muted-foreground">PGA Tour Analytics</span>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                  Sign In
                </Button>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <main className="pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
              <div className="text-center">
                <h2 className="text-5xl font-bold mb-4">
                  Master Your Golf Analytics
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Comprehensive statistical analysis for PGA Tour events. Track players, tournaments, and gain expert insights.
                </p>
                <Button size="lg" onClick={() => setDialogOpen(true)}>
                  Get Started
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="bg-secondary/20 py-24">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-3 gap-8">
                  <Card>
                    <CardHeader>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                        <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <CardTitle>Player Analytics</CardTitle>
                      <CardDescription>
                        View detailed profiles, statistics, and tournament history for 156+ active players
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
                        <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <CardTitle>Tournament Tracking</CardTitle>
                      <CardDescription>
                        Browse current, completed, and upcoming tournaments with comprehensive data
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mb-4">
                        <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <CardTitle>Expert Insights</CardTitle>
                      <CardDescription>
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