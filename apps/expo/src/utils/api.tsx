import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import superjson from "superjson";

import type { AppRouter } from "@duo-snap/api";

import { getBaseUrl } from "./base-url";
import { supabase } from "./supabase";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: createTRPCClient({
    links: [
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === "development" ||
          (opts.direction === "down" && opts.result instanceof Error),
        colorMode: "ansi",
      }),
      httpBatchLink({
        transformer: superjson,
        url: `${getBaseUrl()}/api/trpc`,
        async headers() {
          const headers = new Map<string, string>();
          headers.set("x-trpc-source", "expo-react");

          if (supabase) {
            const { data } = await supabase.auth.getSession();
            if (data.session?.access_token) {
              headers.set("authorization", "Bearer " + data.session.access_token);
            }
          }
          return headers;
        },
      }),
    ],
  }),
  queryClient,
});

export type { RouterInputs, RouterOutputs } from "@duo-snap/api";

