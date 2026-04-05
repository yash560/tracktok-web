import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrackTok | AI Expense & Income Auto Tracker",
  description: "Track your spending at a glance with AI-powered analytics, smart categorization, and automatic transaction detection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="font-sans min-h-screen bg-background-light dark:bg-background-dark text-text-main dark:text-text-light transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
