import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z, ZodError } from "zod/v4";

import type { AuthUser } from "@duo-snap/auth";
import { getAuthUser, MissingSupabaseConfigError } from "@duo-snap/auth";
import { db, requireDb } from "@duo-snap/db/client";
import { profiles } from "@duo-snap/db/schema";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  let user: AuthUser | null = null;
  let authConfigError: string | null = null;

  try {
    user = await getAuthUser(opts.headers);
  } catch (error) {
    if (error instanceof MissingSupabaseConfigError) {
      authConfigError = error.message;
    } else {
      throw error;
    }
  }

  return {
    db,
    headers: opts.headers,
    user,
    authConfigError,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError:
        error.cause instanceof ZodError
          ? z.flattenError(error.cause as ZodError<Record<string, unknown>>)
          : null,
    },
  }),
});

export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();
  const result = await next();
  const end = Date.now();

  if (t._config.isDev) {
    console.log(`[TRPC] ${path} took ${end - start}ms`);
  }

  return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware);

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(async ({ ctx, next }) => {
    if (ctx.authConfigError) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: ctx.authConfigError,
      });
    }

    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Sign in with one of the allowed Duo Snap emails.",
      });
    }

    const database = requireDb(ctx.db);

    await database
      .insert(profiles)
      .values({
        id: ctx.user.id,
        email: ctx.user.email,
        displayName: ctx.user.displayName,
        avatarUrl: ctx.user.avatarUrl,
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          email: ctx.user.email,
          displayName: ctx.user.displayName,
          avatarUrl: ctx.user.avatarUrl,
        },
      });

    return next({
      ctx: {
        ...ctx,
        db: database,
        user: ctx.user,
      },
    });
  });

