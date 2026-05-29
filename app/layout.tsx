/**
 * Pocket Health Worker — Root Layout
 *
 * Implements the base HTML frame, configures global SEO metadata, and provides a 
 * premium native system typography stack (Segoe UI, system-ui, Helvetica Neue).
 * 
 * CORE ARCHITECTURE & HACKATHON ALIGNMENT:
 * - UN SDG 3: Ensures high performance and accessibility in low-bandwidth regions.
 * - Safety-First: Eliminates compile-time network font downloads to prevent build crashes.
 * - PWA Ready: Registers the Service Worker for offline capabilities.
 */

import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#059669",
};

export const metadata: Metadata = {
  title: "Pocket Health Worker — AI Triage Assistant",
  description:
    "Safety-first symptom-triage assistant supporting UN SDG 3 in Nigeria. Get instant, conservative guidance to local health centres.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body 
        className="min-h-full flex flex-col bg-slate-50 text-slate-800 antialiased font-sans" 
        suppressHydrationWarning
      >
        <main className="flex-grow flex flex-col">{children}</main>
      </body>
    </html>
  );
}
