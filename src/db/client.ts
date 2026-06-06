import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnv } from "@/lib/env";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle> | null = null;

export function createDb(databaseUrl = getEnv().DATABASE_URL) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to create a database client");
  }

  if (!dbInstance) {
    dbInstance = drizzle(postgres(databaseUrl, { prepare: false }), { schema });
  }

  return dbInstance;
}
