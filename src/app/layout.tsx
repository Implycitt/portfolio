import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import Header from "@/components/ui/Header";
import PageTransition from "@/components/ui/PageTransition";
import SmoothScroll from "@/components/ui/SmoothScroll";

const firaCodeNerd = localFont({
  src: [
    {
      path: "../../public/fonts/FiraCodeNerdFont-Regular.ttf",
      style: "normal",
    },
  ],
  variable: "--font-fira-code-nerd",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quentinb.dev";

const DESCRIPTION =
  "Quentin Bordelon — computer science and physics undergraduate at LSU building software, developer tooling and research at the intersection of engineering, physics and math.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Quentin Bordelon — CS & Physics",
  description: DESCRIPTION,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    siteName: "Quentin Bordelon",
    title: "Quentin Bordelon — CS & Physics",
    description: DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "Quentin Bordelon — CS & Physics",
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${firaCodeNerd.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a href="#content" className="skip-link">
          skip to content
        </a>
        <Header />
        <SmoothScroll>
          <PageTransition>{children}</PageTransition>
        </SmoothScroll>
      </body>
    </html>
  );
}
