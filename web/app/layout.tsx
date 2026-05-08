import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TabMind — AI Session Tracker for Chrome",
  description:
    "TabMind watches your browser tabs silently and surfaces what you've been working on. Passive AI session analysis, per-page notes, and extracted todos — all stored locally.",
  keywords: ["chrome extension", "tab tracker", "AI productivity", "session analysis", "browser productivity"],
  authors: [{ name: "thribhuvan003" }],
  openGraph: {
    title: "TabMind — AI Session Tracker",
    description: "Passive AI that watches your tabs and surfaces insights. No cloud. No accounts.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TabMind",
    description: "Your browser has a memory now.",
  },
};

export const viewport: Viewport = {
  themeColor: "#07080d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
