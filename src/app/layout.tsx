import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "NXTSTORE | Premium E-Commerce Experience",
    template: "%s | NXTSTORE",
  },
  description: "Discover the latest trends in fashion, electronics, and lifestyle. A premium, scalable e-commerce platform built with Next.js 15.",
  keywords: ["e-commerce", "nextjs", "store", "shopping", "premium", "nxtstore"],
  authors: [{ name: "Ayush Deep", url: "https://github.com/ayush-05-ad" }],
  creator: "Ayush Deep",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    title: "NXTSTORE | Premium E-Commerce Experience",
    description: "Discover the latest trends in fashion, electronics, and lifestyle.",
    siteName: "NXTSTORE",
  },
  twitter: {
    card: "summary_large_image",
    title: "NXTSTORE | Premium E-Commerce Experience",
    description: "Discover the latest trends in fashion, electronics, and lifestyle.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link 
            rel="stylesheet" 
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
            integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" 
            crossOrigin="anonymous" 
            referrerPolicy="no-referrer" 
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
          <AnalyticsProvider />
        </body>
      </html>
    </ClerkProvider>
  );
}
