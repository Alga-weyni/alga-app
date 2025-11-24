import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from '../shared/schema.js';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const dbUrl = new URL(process.env.DATABASE_URL);
// Add connection parameters for faster timeout on Render
dbUrl.searchParams.set('sslmode', 'require');
dbUrl.searchParams.set('connect_timeout', '10');

export const pool = new Pool({ 
  connectionString: dbUrl.toString(),
  max: 5,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 10000,
});
export const db = drizzle({ client: pool, schema });