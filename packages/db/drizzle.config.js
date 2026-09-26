"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL");
}
exports.default = {
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL },
  casing: "snake_case",
};
