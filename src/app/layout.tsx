import type { Metadata, Viewport } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { Pixelify_Sans, Silkscreen } from "next/font/google";
import Header from "@/components/ui/Header";
import SiteFooter from "@/components/ui/SiteFooter";
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

const pixelDisplay = Silkscreen({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-os-display",
  preload: false,
});

const pixelProse = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-os-prose",
  preload: false,
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quentinb.dev";

const DESCRIPTION =
  "Quentin Bordelon — computer science and physics undergraduate at LSU building software, developer tooling and research at the intersection of engineering, physics and math.";

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#11111b",
};

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
    <html
      lang="en"
      className={`${firaCodeNerd.variable} ${pixelDisplay.variable} ${pixelProse.variable} h-full antialiased`}
    >
      <body id="top" className="min-h-full flex flex-col">
        <a href="#content" className="skip-link">
          skip to content
        </a>
        <Header />
        <SmoothScroll>
          <div className="flex-1 w-full">{children}</div>
          <SiteFooter />
        </SmoothScroll>
      </body>
    </html>
  );
}
