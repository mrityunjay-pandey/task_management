"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { loginAsGuest } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGuestLogin() {
    // Prevent accidental duplicate submissions (e.g. a double-click) from
    // firing two guest-creation requests.
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      await loginAsGuest();
      router.push("/tasks");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't sign in right now. Please try again.",
      );
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        {/* "Pyramid" wordmark - the app's identity in the Figma design */}
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <PyramidMark />
          Pyramid
        </div>

        <div className="w-full rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-lg font-semibold text-card-foreground">
              Let&apos;s get back on track
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your email below to login to your account.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              onClick={handleGuestLogin}
            >
              Continue as Guest
            </Button>

            {/* Decorative only - this assessment implements guest login only.
                Kept visible to match the Figma design; documented as an
                intentional deviation in README.md. */}
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              disabled
              title="Not implemented - guest login only, per assessment scope"
            >
              <GoogleMark />
              Login with Google
            </Button>
          </div>

          {error ? (
            <p role="alert" className="mt-4 text-center text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        <p className="max-w-[280px] text-center text-xs text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <a href="#" className="underline underline-offset-2">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-2">
            Privacy Policy
          </a>
        </p>
      </div>
    </main>
  );
}

function PyramidMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2 L18 17 H2 Z" fill="currentColor" />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}
