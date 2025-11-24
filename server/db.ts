import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from '../shared/schema.js';

neonConfig.webSocketConstructor = ws;
neonConfig.connectionTimeoutMillis = 5000; // 5 second timeout
neonConfig.idleTimeoutMillis = 30000; // 30 second idle timeout

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const dbUrl = new URL(process.env.DATABASE_URL);
dbUrl.searchParams.append('sslmode', 'require');
dbUrl.searchParams.append('connect_timeout', '5');

export const pool = new Pool({ 
  connectionString: dbUrl.toString(),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
export const db = drizzle({ client: pool, schema });