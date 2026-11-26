/**
 * Pocket Health Worker — Root layout
 *
 * System fonts only (no web-font download), brand theme colour, PWA manifest.
 * The page itself owns the single <main> landmark.
 */

import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#1c1412",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Pocket Health Worker — first-line health guidance",
  description:
    "A calm hand for when you can't reach a doctor. Free, private, works offline. Guidance, not diagnosis.",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg", apple: "/icon-192.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-cream text-ink antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
