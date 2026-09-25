import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const photos = pgTable("photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  imagePath: text("image_path").notNull(),
  caption: text("caption"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const profilesRelations = relations(profiles, ({ many }) => ({
  photos: many(photos),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  profile: one(profiles, {
    fields: [photos.userId],
    references: [profiles.id],
  }),
}));

export const CreatePhotoSchema = createInsertSchema(photos, {
  imagePath: z.string().min(1).max(500),
  caption: z.string().max(160).optional().nullable(),
}).pick({
  imagePath: true,
  caption: true,
});

export const UpdateProfileSchema = createInsertSchema(profiles, {
  displayName: z.string().max(80).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
}).pick({
  displayName: true,
  avatarUrl: true,
});

export const storagePoliciesSql = sql`
  -- Run these in Supabase SQL editor if you choose direct authenticated uploads.
  -- The app primarily uses photos.createUploadUrl, so clients never receive a service-role key.
`;

