import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/lib/auth-provider";

// NOTE: font choice is intentionally left as a system-font fallback here.
// We'll set the real typeface to match the Figma design in the
// design-fidelity phase (Phase 10), likely via next/font/local or a
// self-hosted font so we don't depend on a live Google Fonts fetch at build time.

export const metadata: Metadata = {
  title: "Task Management",
  description: "Task management system built for the fresher assessment.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning is required by next-themes: it sets the
    // data-theme attribute via an inline script before React hydrates,
    // so the server-rendered and client-rendered <html> attributes will
    // legitimately differ for one frame - this tells React that's expected.
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
