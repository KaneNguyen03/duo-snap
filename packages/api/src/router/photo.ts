import { randomUUID } from "node:crypto";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import {
  createSupabaseAdminClient,
  MissingSupabaseConfigError,
  SNAP_BUCKET,
} from "@duo-snap/auth";
import { eq } from "@duo-snap/db";
import { CreatePhotoSchema, photos } from "@duo-snap/db/schema";

import { protectedProcedure } from "../trpc";

const imageContentTypeSchema = z
  .string()
  .regex(/^image\//, "Only image uploads are supported.");

function extensionFrom(fileName: string, contentType: string) {
  const fromFile = fileName
    .split(".")
    .pop()
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  if (fromFile) return fromFile;

  const fromType = contentType
    .split("/")
    .at(1)
    ?.replace(/[^a-z0-9]/g, "");
  return fromType || "jpg";
}

async function signImagePath(path: string) {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.storage
      .from(SNAP_BUCKET)
      .createSignedUrl(path, 60 * 60);

    if (error) return null;

    return data.signedUrl;
  } catch (error) {
    if (error instanceof MissingSupabaseConfigError) return null;
    throw error;
  }
}

export const photoRouter = {
  list: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.query.photos.findMany({
      with: {
        profile: true,
      },
      orderBy: (photo, { desc }) => [desc(photo.createdAt)],
      limit: 60,
    });

    return Promise.all(
      rows.map(async (photo) => ({
        id: photo.id,
        caption: photo.caption,
        createdAt: photo.createdAt,
        imagePath: photo.imagePath,
        imageUrl: await signImagePath(photo.imagePath),
        author: {
          id: photo.profile.id,
          email: photo.profile.email,
          displayName: photo.profile.displayName,
          avatarUrl: photo.profile.avatarUrl,
        },
      })),
    );
  }),

  createUploadUrl: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1).max(160),
        contentType: imageContentTypeSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let supabase;

      try {
        supabase = createSupabaseAdminClient();
      } catch (error) {
        if (error instanceof MissingSupabaseConfigError) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message:
              "Missing SUPABASE_SERVICE_ROLE_KEY. It is required on the server to create signed upload URLs.",
          });
        }

        throw error;
      }

      const extension = extensionFrom(input.fileName, input.contentType);
      const path = `${ctx.user.id}/${Date.now()}-${randomUUID()}.${extension}`;

      const { data, error } = await supabase.storage
        .from(SNAP_BUCKET)
        .createSignedUploadUrl(path);

      if (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }

      return {
        path: data.path,
        token: data.token,
      };
    }),

  create: protectedProcedure
    .input(CreatePhotoSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.imagePath.startsWith(`${ctx.user.id}/`)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Photos can only be attached to the signed upload path for your user.",
        });
      }

      const [photo] = await ctx.db
        .insert(photos)
        .values({
          userId: ctx.user.id,
          imagePath: input.imagePath,
          caption: input.caption?.trim() || null,
        })
        .returning();

      return photo;
    }),

  delete: protectedProcedure
.input(z.object({ id: z.string().uuid() }))
.mutation(async ({ ctx, input }) => {
  const existing = await ctx.db.query.photos.findFirst({
    where: eq(photos.id, input.id)
  });
  if (!existing) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Photo not found" });
  }
  if (existing.userId !== ctx.user.id) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Not your photo" });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.storage.from(SNAP_BUCKET).remove([existing.imagePath]);
    if (error) {
      console.error("Storage cleanup error:", error);
    }
  } catch (err) {
    console.error("Storage cleanup exception:", err);
  }

  const [photo] = await ctx.db
    .delete(photos)
    .where(eq(photos.id, input.id))
    .returning();

  return photo ?? null;
}),
} satisfies TRPCRouterRecord;
