import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export class MissingDatabaseConfigError extends Error {
  constructor(message = "DATABASE_URL is not configured.") {
    super(message);
    this.name = "MissingDatabaseConfigError";
  }
}

const databaseUrl = process.env.DATABASE_URL;

const client = databaseUrl
  ? postgres(databaseUrl, {
      prepare: false,
      max: 5,
    })
  : null;

export const db = client
  ? drizzle(client, {
      schema,
      casing: "snake_case",
    })
  : null;

export type Database = NonNullable<typeof db>;

export function requireDb(database: typeof db = db): Database {
  if (!database) {
    throw new MissingDatabaseConfigError(
      "Missing DATABASE_URL. Add your Supabase Postgres connection string to .env.",
    );
  }

  return database;
}
