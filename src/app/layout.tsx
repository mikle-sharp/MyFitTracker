import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const monocraft = localFont({
  src: "../fonts/Monocraft.ttf",
  variable: "--font-monocraft",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Мой журнал тренировок",
  description: "Персональный журнал тренировок с отслеживанием прогресса и личных рекордов",
  keywords: ["фитнес", "тренировки", "журнал", "спорт", "зал", "fitness", "workout"],
  authors: [{ name: "Fitness Journal" }],
  manifest: "./manifest.json",
  icons: {
    icon: "./icon-192.png",
    apple: "./icon-512.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Мой журнал тренировок",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Мой журнал тренировок",
    description: "Персональный журнал тренировок",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#18181b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="./icon-512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${inter.variable} ${monocraft.variable} font-sans antialiased bg-zinc-950 text-white min-h-screen`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
