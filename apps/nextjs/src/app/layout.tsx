import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { cn } from "@duo-snap/ui";
import { ThemeProvider } from "@duo-snap/ui/theme";
import { Toaster } from "@duo-snap/ui/toast";

import { env } from "~/env";
import { TRPCReactProvider } from "~/trpc/react";

import "~/app/styles.css";

const appUrl = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Duo Snap",
  description:
    "A private Locket-inspired photo feed for two people, built as a fullstack portfolio case study.",
  openGraph: {
    title: "Duo Snap",
    description:
      "A private Locket-inspired photo feed for two people, built with Next.js, Expo, tRPC, Drizzle, and Supabase.",
    url: appUrl,
    siteName: "Duo Snap",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff4d8d",
};

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background text-foreground min-h-screen font-sans antialiased",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <ThemeProvider>
          <TRPCReactProvider>{props.children}</TRPCReactProvider>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
