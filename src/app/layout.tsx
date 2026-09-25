import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "Duo Snap",
  description: "Private couple snaps, inspired by Locket.",
  applicationName: "Duo Snap",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { themeColor: "#fff8f2", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body className={inter.className}>{children}</body></html>;
}
