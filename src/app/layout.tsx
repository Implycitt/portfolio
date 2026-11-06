import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
