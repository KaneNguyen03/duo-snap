import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { getAllowedEmails, getConfigStatus, isAllowedEmail } from "@duo-snap/auth";

import { protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = {
  status: publicProcedure.query(() => getConfigStatus()),

  canRequestSignIn: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(({ input }) => {
      const allowedEmailCount = getAllowedEmails().size;
      const allowed = isAllowedEmail(input.email);

      return {
        allowed,
        message: allowed
          ? "Email is allowed for Duo Snap."
          : allowedEmailCount === 0
            ? "ALLOWED_EMAILS is not configured yet."
            : "This Duo Snap is private and only accepts the two configured emails.",
      };
    }),

  me: protectedProcedure.query(({ ctx }) => ctx.user),
} satisfies TRPCRouterRecord;

