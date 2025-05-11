import { MongoClient, ServerApiVersion } from 'mongodb';

// Function to get the MongoDB URI from environment variables
const getMongoUri = (): string => {
  // Use dedicated MongoDB URI if available
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }
  
  // Try to use PostgreSQL connection info to build MongoDB URI
  try {
    if (process.env.PGHOST && process.env.PGUSER) {
      const host = process.env.PGHOST;
      const port = process.env.PGPORT || "27017";
      const username = process.env.PGUSER;
      const password = process.env.PGPASSWORD || '';
      const database = process.env.PGDATABASE || 'securitySentinel';
      
      // Only include credentials if both username and password are available
      const credentials = username && password ? `${username}:${password}@` : '';
      return `mongodb://${credentials}${host}:${port}/${database}`;
    }
  } catch (e) {
    console.error("Failed to build MongoDB URI from PG environment variables:", e);
  }
  
  // Default fallback for local development
  return "mongodb://localhost:27017/securitySentinel";
};

// Determine the MongoDB URI
const uri = getMongoUri();
console.log("MongoDB connection URI (credentials redacted):", 
  uri.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@'));

// Database Name
const dbName = uri.split('/').pop() || 'securitySentinel';

// Create a MongoClient with a MongoClientOptions object
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Reasonable timeouts to prevent hanging
  connectTimeoutMS: 5000,
  socketTimeoutMS: 30000,
});

let dbInstance: any = null;

export const connectToDatabase = async () => {
  if (dbInstance) {
    return dbInstance;
  }
  
  // Use a Promise with timeout to prevent hanging
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.error("MongoDB connection timed out after 3 seconds");
      resolve(null);
    }, 3000);
    
    (async () => {
      try {
        console.log("Attempting to connect to MongoDB...");
        await client.connect();
        console.log("Connected successfully to MongoDB server");
        dbInstance = client.db(dbName);
        clearTimeout(timeout);
        resolve(dbInstance);
      } catch (error) {
        console.error("MongoDB connection error:", error);
        clearTimeout(timeout);
        // Return null to allow graceful fallback to in-memory storage
        resolve(null);
      }
    })();
  });
};

export const getCollection = async (collectionName: string) => {
  const db = await connectToDatabase();
  if (!db) {
    throw new Error("Database connection failed");
  }
  return db.collection(collectionName);
};

// Health check function with timeout for reliability
export const checkConnection = async () => {
  return new Promise<boolean>((resolve) => {
    const timeout = setTimeout(() => {
      console.error("MongoDB connection check timed out after 2 seconds");
      resolve(false);
    }, 2000);
    
    (async () => {
      try {
        const db = await connectToDatabase();
        if (!db) {
          clearTimeout(timeout);
          resolve(false);
          return;
        }
        
        // Ping the database to verify connection is working
        await db.command({ ping: 1 });
        clearTimeout(timeout);
        resolve(true);
      } catch (error) {
        console.error("Database health check failed:", error);
        clearTimeout(timeout);
        resolve(false);
      }
    })();
  });
};

export default {
  client,
  connectToDatabase,
  getCollection,
  checkConnection
};