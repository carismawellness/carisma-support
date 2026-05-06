import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/lib/query-client";
import { NavShell } from "@/components/nav/nav-shell";
import { DummyBanner } from "@/components/dashboard/dummy-banner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Life Cockpit",
  description: "Personal dashboard — Health · Wealth · Love",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <DummyBanner />
          <NavShell>{children}</NavShell>
        </QueryProvider>
      </body>
    </html>
  );
}
