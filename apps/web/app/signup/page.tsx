"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, ArrowRight, ChevronLeft } from "lucide-react";
import Logo from "@/components/logo";

const signupSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const signup = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);
  const storeError = useAuthStore((state) => state.error);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const rehydrated = useAuthStore((state) => state.rehydrated);

  useEffect(() => {
    if (rehydrated && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, rehydrated, router]);

  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SignupFormValues) {
    setSubmitError(null);
    try {
      await signup(data);
      router.push("/");
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to create account. Please try again."
      );
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 bg-background">
      <div className="w-full max-w-xs sm:max-w-sm">
        <div className="flex items-center justify-center mb-8 sm:mb-10">
          <Logo size="lg" />
        </div>

        {/* Card */}
        <div className="p-4 sm:p-6 bg-card border border-border rounded-2xl">
          <h1 className="font-heading text-xl sm:text-2xl font-medium tracking-tight text-center mb-1">
            Create account
          </h1>
          <p className="text-sm text-muted-foreground font-body text-center mb-5 sm:mb-6">
            Start organizing your life today
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium font-body text-foreground mb-1.5"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                {...register("username")}
                placeholder="johndoe"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.username && (
                <p className="mt-1 text-xs text-destructive font-body">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium font-body text-foreground mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive font-body">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium font-body text-foreground mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("password")}
                  placeholder="Create a password"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-destructive font-body">
                  {errors.password.message}
                </p>
              )}
            </div>

            {(submitError || storeError) && (
              <div className="text-sm text-destructive font-body text-center">
                {submitError || storeError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-gentle-pulse">Creating account...</span>
              ) : (
                <>
                  Sign up
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-5 sm:mt-6 space-y-3 text-center">
          <p className="text-sm text-muted-foreground font-body">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground hover:underline"
            >
              Sign in
            </Link>
          </p>
          <Link
            href="/"
            className="group inline-flex items-center text-sm text-muted-foreground font-body hover:text-foreground transition-colors"
          >
            <span className="inline-flex items-center gap-0 overflow-hidden">
              <ChevronLeft
                size={14}
                className="opacity-0 -translate-x-1 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-0"
              />
              <span className="ml-0 transition-all duration-200 ease-out group-hover:-ml-0.5">
                Back to home
              </span>
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
