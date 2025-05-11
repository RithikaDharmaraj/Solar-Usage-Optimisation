import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '@shared/schema';

// Get database connection string from environment variables
const getDatabaseURL = (): string => {
  // Use DATABASE_URL if available
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // Try to build URL from individual PG environment variables
  try {
    if (process.env.PGHOST && process.env.PGUSER) {
      const host = process.env.PGHOST;
      const port = process.env.PGPORT || "5432";
      const username = process.env.PGUSER;
      const password = process.env.PGPASSWORD || '';
      const database = process.env.PGDATABASE || 'neondb';
      
      return `postgres://${username}:${password}@${host}:${port}/${database}`;
    }
  } catch (e) {
    console.error("Failed to build database URL from PG environment variables:", e);
  }
  
  // Default fallback for local development
  return "postgres://localhost:5432/local_db";
};

const connectionString = getDatabaseURL();
console.log("Database connection string detected (credentials hidden)");

// Create a connection pool
export const pool = new Pool({ connectionString });

// Create a Drizzle ORM instance
export const db = drizzle(pool, { schema });

// Check connection health
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    // Simple query to test connection
    const result = await pool.query('SELECT 1');
    return result.rows.length > 0;
  } catch (error) {
    console.error("Database connection check failed:", error);
    return false;
  }
};

export default {
  pool,
  db,
  checkDatabaseConnection
};