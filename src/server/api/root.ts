import { snapRouter } from "@/server/api/routers/snap";
import { createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({ snap: snapRouter });
export type AppRouter = typeof appRouter;
