"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={flow}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <CardHeader>
              <CardTitle>{flow === "signIn" ? "Sign In" : "Sign Up"}</CardTitle>
              <CardDescription>
                {flow === "signIn"
                  ? "Enter your credentials to access GolfGod"
                  : "Create an account to get started with GolfGod"}
              </CardDescription>
            </CardHeader>
          </motion.div>
        </AnimatePresence>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              setError(null);
              const formData = new FormData(e.target as HTMLFormElement);
              formData.set("flow", flow);
              try {
                await signIn("password", formData);
                router.push("/");
              } catch (error: any) {
                setError(error.message);
              } finally {
                setLoading(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="name@example.com"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Loading..." : (flow === "signIn" ? "Sign In" : "Sign Up")}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="relative my-4"
            >
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={loading}
                onClick={() => {
                  setLoading(true);
                  signIn("google").catch((error) => {
                    setError(error.message);
                    setLoading(false);
                  });
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.3 }}
              className="text-center mt-4"
            >
              <Button
                type="button"
                variant="link"
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                className="text-sm"
              >
                {flow === "signIn"
                  ? "Don't have an account? Sign up instead"
                  : "Already have an account? Sign in instead"}
              </Button>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                    <p className="text-sm text-destructive">
                      Error: {error}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  );
}