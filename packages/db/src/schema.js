"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storagePoliciesSql = exports.UpdateProfileSchema = exports.CreatePhotoSchema = exports.photosRelations = exports.profilesRelations = exports.photos = exports.profiles = void 0;
var drizzle_orm_1 = require("drizzle-orm");
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_zod_1 = require("drizzle-zod");
var v4_1 = require("zod/v4");
exports.profiles = (0, pg_core_1.pgTable)("profiles", {
    id: (0, pg_core_1.uuid)("id").primaryKey(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    displayName: (0, pg_core_1.text)("display_name"),
    avatarUrl: (0, pg_core_1.text)("avatar_url"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});
exports.photos = (0, pg_core_1.pgTable)("photos", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id")
        .notNull()
        .references(function () { return exports.profiles.id; }, { onDelete: "cascade" }),
    imagePath: (0, pg_core_1.text)("image_path").notNull(),
    caption: (0, pg_core_1.text)("caption"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});
exports.profilesRelations = (0, drizzle_orm_1.relations)(exports.profiles, function (_a) {
    var many = _a.many;
    return ({
        photos: many(exports.photos),
    });
});
exports.photosRelations = (0, drizzle_orm_1.relations)(exports.photos, function (_a) {
    var one = _a.one;
    return ({
        profile: one(exports.profiles, {
            fields: [exports.photos.userId],
            references: [exports.profiles.id],
        }),
    });
});
exports.CreatePhotoSchema = (0, drizzle_zod_1.createInsertSchema)(exports.photos, {
    imagePath: v4_1.z.string().min(1).max(500),
    caption: v4_1.z.string().max(160).optional().nullable(),
}).pick({
    imagePath: true,
    caption: true,
});
exports.UpdateProfileSchema = (0, drizzle_zod_1.createInsertSchema)(exports.profiles, {
    displayName: v4_1.z.string().max(80).optional().nullable(),
    avatarUrl: v4_1.z.string().url().optional().nullable(),
}).pick({
    displayName: true,
    avatarUrl: true,
});
exports.storagePoliciesSql = (0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  -- Run these in Supabase SQL editor if you choose direct authenticated uploads.\n  -- The app primarily uses photos.createUploadUrl, so clients never receive a service-role key.\n"], ["\n  -- Run these in Supabase SQL editor if you choose direct authenticated uploads.\n  -- The app primarily uses photos.createUploadUrl, so clients never receive a service-role key.\n"])));
var templateObject_1;
