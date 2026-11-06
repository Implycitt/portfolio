import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quentinb.dev";

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#11111b",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Quentin Bordelon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${geistMono.variable}`}>
      <body className="min-h-full flex flex-col font-mono">{children}</body>
    </html>
  );
}
