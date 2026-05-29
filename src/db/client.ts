import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnv } from "@/lib/env";
import * as schema from "./schema";

export function createDb(databaseUrl = getEnv().DATABASE_URL) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to create a database client");
  }

  return drizzle(postgres(databaseUrl, { prepare: false }), { schema });
}
