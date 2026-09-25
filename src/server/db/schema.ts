import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const couples = pgTable("couples", {
  id: uuid("id").defaultRandom().primaryKey(),
  inviteCode: text("invite_code").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const people = pgTable("people", {
  id: uuid("id").defaultRandom().primaryKey(),
  coupleId: uuid("couple_id").references(() => couples.id, { onDelete: "cascade" }).notNull(),
  displayName: text("display_name").notNull(),
  role: text("role", { enum: ["me", "partner"] }).notNull(),
});

export const snaps = pgTable("snaps", {
  id: uuid("id").defaultRandom().primaryKey(),
  coupleId: uuid("couple_id").references(() => couples.id, { onDelete: "cascade" }).notNull(),
  authorId: uuid("author_id").references(() => people.id, { onDelete: "cascade" }).notNull(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption").notNull().default(""),
  mood: text("mood").notNull().default("💛"),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  reactionsCount: integer("reactions_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const couplesRelations = relations(couples, ({ many }) => ({ people: many(people), snaps: many(snaps) }));
export const peopleRelations = relations(people, ({ one, many }) => ({
  couple: one(couples, { fields: [people.coupleId], references: [couples.id] }),
  snaps: many(snaps),
}));
export const snapsRelations = relations(snaps, ({ one }) => ({
  couple: one(couples, { fields: [snaps.coupleId], references: [couples.id] }),
  author: one(people, { fields: [snaps.authorId], references: [people.id] }),
}));
