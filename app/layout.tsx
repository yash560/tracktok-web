import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import { ThemeScript } from "@/components/ThemeScript";
import { CurrencyProvider } from "@/components/CurrencyContext";

export const metadata: Metadata = {
  metadataBase: new URL("https://tracktok.thewebvale.com"),
  title: {
    default: "TrackTok — AI-Powered Expense Tracker & Financial Analytics",
    template: "%s | TrackTok",
  },
  description:
    "TrackTok transforms every SMS, bank alert, and receipt into automated expense analytics, smart budgeting, and squad splits with zero effort. Engineered with TheWebVale.",
  keywords: [
    "TrackTok",
    "expense tracker",
    "AI expense tracking",
    "finance tracker India",
    "smart budget",
    "squad splits",
    "TheWebVale",
  ],
  authors: [{ name: "TheWebVale" }],
  robots: "index, follow",
  alternates: {
    canonical: "https://tracktok.thewebvale.com",
  },
  openGraph: {
    title: "TrackTok — AI-Powered Expense Tracker & Financial Analytics",
    description:
      "TrackTok turns transactions into clean money stories. Smart budgets, instant AI financial insights, and squad-friendly splits.",
    url: "https://tracktok.thewebvale.com",
    siteName: "TrackTok",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrackTok — AI-Powered Expense Tracker",
    description:
      "AI-powered expense tracking and financial analytics for everyone.",
  },
  other: {
    "geo.region": "IN-DL",
    "geo.placename": "New Delhi, India",
    "geo.position": "28.6139;77.2090",
    "ICBM": "28.6139, 77.2090",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://tracktok.thewebvale.com/#application",
      "name": "TrackTok",
      "url": "https://tracktok.thewebvale.com",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web, Android, iOS",
      "description":
        "AI-powered personal finance management, smart expense categorization, receipt parsing, and shared bill splitting.",
      "creator": {
        "@type": "Organization",
        "name": "TheWebVale",
        "url": "https://thewebvale.com",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://tracktok.thewebvale.com/#website",
      "url": "https://tracktok.thewebvale.com",
      "name": "TrackTok AI Expense Platform",
      "publisher": {
        "@id": "https://tracktok.thewebvale.com/#application",
      },
    },
  ],
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
