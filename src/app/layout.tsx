import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
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

export const metadata: Metadata = {
  title: "Quentin Bordelon",
  description: "Portfolio",
  icons: {
    icon: "/favicon.ico",
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
        <Header />
        <SmoothScroll>
          <PageTransition>{children}</PageTransition>
        </SmoothScroll>
      </body>
    </html>
  );
}
