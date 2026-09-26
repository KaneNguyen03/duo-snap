import { authRouter } from "./router/auth";
import { photoRouter } from "./router/photo";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  photos: photoRouter,
});

export type AppRouter = typeof appRouter;
