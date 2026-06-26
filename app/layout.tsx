import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import { ThemeScript } from "@/components/ThemeScript";
import { CurrencyProvider } from "@/components/CurrencyContext";

export const metadata: Metadata = {
  title: "TrackTok - AI Expense Tracker",
  description: "AI-powered expense tracking and financial analytics for everyone",
  keywords: ["expense tracker", "finance", "budget", "spending", "AI"],
  authors: [{ name: "TrackTok Team" }],
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#2F2E51" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
        }} />
      </head>
      <body className="antialiased">
        <div className="min-h-screen">
          <AuthProvider>
            <CurrencyProvider>
              <ThemeScript />
              {children}
            </CurrencyProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
