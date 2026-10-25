import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { LiveBanner, SampleBanner } from "@/components/layout/sample-banner";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { DetailLevelProvider } from "@/components/ui/detail-level";
import { configuredDataMode } from "@/lib/data";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif-display", display: "swap" });

export const metadata: Metadata = {
  title: { default: "IPO Simplified: understand an IPO before you invest", template: "%s · IPO Simplified" },
  description:
    "Company fundamentals, valuation and risks of Indian IPOs explained in plain English. Educational information, not investment advice.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const mode = configuredDataMode();
  return (
    // data-theme is set by the inline script before hydration, so suppress the expected mismatch.
    <html lang="en-IN" className={`${inter.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-dvh">
        <DetailLevelProvider>
          {mode === "sample" ? <SampleBanner /> : <LiveBanner />}
          <SiteHeader />
          <main id="main" className="mx-auto max-w-6xl px-4">
            {children}
          </main>
          <SiteFooter dataMode={mode} />
        </DetailLevelProvider>
        <Analytics />
      </body>
    </html>
  );
}
