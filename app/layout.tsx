import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { TierProvider } from "@/three/useTierDetect";
import { SmoothScroll } from "@/lib/lenis";

export const metadata: Metadata = {
  title: "Studio Yume — Boot the dream engine.",
  description:
    "AI marketing from inside the dream machine. Studio Yume builds AI-native marketing systems for brands ready to move faster, look sharper, and stop creating generic content.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-ink font-sans text-fg antialiased">
        {/* no-JS: force-show everything framer-motion would reveal */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>

        <TierProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </TierProvider>

        {/* texture layer: scanlines + grain, one fixed overlay (PRD §5) */}
        <div aria-hidden className="pointer-events-none fixed inset-0 z-50">
          <div className="scanlines absolute inset-0" />
          <div className="grain absolute inset-0" />
        </div>
      </body>
    </html>
  );
}
