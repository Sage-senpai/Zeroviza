import type { Metadata, Viewport } from "next";
import { ClientProviders } from "./client-providers";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import "./globals.css";
// Using system fonts — avoids Google Fonts network requirement during build.
// CSS --font-sans falls back to system-ui in globals.css.

export const metadata: Metadata = {
  title: "ZeroViza — AI Immigration Legal Aid",
  description:
    "Multilingual AI immigration advisor. Get guidance on visas, asylum, work permits, and family reunification — powered by 0G decentralized compute and storage.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "ZeroViza — AI Immigration Legal Aid",
    description: "Free, multilingual AI immigration guidance powered by 0G decentralized infrastructure.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZeroViza — AI Immigration Legal Aid",
    description: "Free, multilingual AI immigration guidance powered by 0G decentralized infrastructure.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ZeroViza",
  },
};

export const viewport: Viewport = {
  themeColor: "#DC2626",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorBoundary>
          <ClientProviders>{children}</ClientProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}
