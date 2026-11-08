import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/lib/components/Header";
import "katex/dist/katex.min.css";
import "remark-github-blockquote-alert/alert.css"

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
      <body className="flex flex-col mx-4 sm:mx-8 lg:mx-16 mt-8 font-mono">
        <Header/>
        {children}
      </body>
    </html>
  );
}
