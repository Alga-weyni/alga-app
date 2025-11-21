import pkg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const connectionString = process.env.DATABASE_URL;
const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
const ssl = isLocal ? false : { rejectUnauthorized: false };

export const pool = new Pool({
  connectionString,
  ssl,
  max: 5,
  keepAlive: true,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
});

export const db = drizzle(pool, { schema });
