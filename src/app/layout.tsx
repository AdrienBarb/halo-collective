import type { Metadata } from "next";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import GlobalErrorHandler from "@/components/GlobalErrorHandler";
import { QueryProviders } from "@/components/providers/QueryProviders";
import { ConfirmProvider } from "@/components/providers/ConfirmProvider";
import { PostHogProvider } from "@/components/tracking/PostHogProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";
import { genPageMetadata } from "@/lib/seo/genPageMetadata";
import { siteMetadata } from "@/data/siteMetadata";

// Editorial display + headlines + italic pull-quotes + the wordmark "HALO"
// Variable font so we can use opsz (optical size) — see colors_and_type.css
const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

// Body copy (paragraphs, athlete names on cards)
const interTight = Inter_Tight({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

// Eyebrows, meta, dates, ranks, button text — wide-tracked uppercase
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = genPageMetadata({
  title: siteMetadata.title,
  description: siteMetadata.description,
  url: "/",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${interTight.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <NuqsAdapter>
          <QueryProviders>
            <PostHogProvider>
              <ConfirmProvider>
                <div className="flex min-h-screen flex-col">
                  <Navbar />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
                <Toaster position="bottom-center" />
                <GlobalErrorHandler />
              </ConfirmProvider>
            </PostHogProvider>
          </QueryProviders>
        </NuqsAdapter>
      </body>
    </html>
  );
}
