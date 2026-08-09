import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
