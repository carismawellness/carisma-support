import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// All pages need Supabase at runtime — skip static prerendering
export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Carisma Cockpit",
  description: "CEO Business Intelligence Dashboard",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
