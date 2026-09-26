"use client";

import { createSupabaseBrowserClient } from "@duo-snap/auth";

import { env } from "~/env";

let browserClient: ReturnType<typeof createSupabaseBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  browserClient ??= createSupabaseBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return browserClient;
}
