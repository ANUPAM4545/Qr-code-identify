import { MongoClient, ServerApiVersion } from "mongodb";

if (!process.env.MONGODB_URI) {
  console.warn('Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/identity_db";
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 60000,
  connectTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000,
};

// Use a global variable to preserve the MongoDB client across serverless lambda invocations and HMR
const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
  _indexesCreated?: boolean;
};

if (!globalWithMongo._mongoClientPromise) {
  const client = new MongoClient(uri, options);
  globalWithMongo._mongoClientPromise = client.connect().then(async (c) => {
    // Asynchronously ensure high-performance database indexes in background
    if (!globalWithMongo._indexesCreated) {
      globalWithMongo._indexesCreated = true;
      try {
        const db = c.db();
        await Promise.allSettled([
          db.collection("events").createIndex({ slug: 1 }),
          db.collection("events").createIndex({ uniqueSlug: 1 }),
          db.collection("events").createIndex({ workspaceId: 1 }),
          db.collection("guests").createIndex({ eventId: 1, status: 1 }),
          db.collection("guests").createIndex({ eventId: 1, qrCodeId: 1 }),
          db.collection("guests").createIndex({ eventId: 1, email: 1 }),
          db.collection("event_notifications").createIndex({ eventId: 1, createdAt: -1 }),
          db.collection("event_notifications").createIndex({ eventId: 1, read: 1 }),
          db.collection("registration_submissions").createIndex({ eventId: 1, status: 1 }),
          db.collection("qr_codes").createIndex({ eventId: 1 }),
          db.collection("qr_codes").createIndex({ shortId: 1 }),
          db.collection("memberships").createIndex({ userId: 1 }),
          db.collection("memberships").createIndex({ workspaceId: 1 }),
          db.collection("event_settings").createIndex({ eventId: 1 }),
          db.collection("notification_settings").createIndex({ eventId: 1 }),
        ]);
      } catch {
        // Ignore index creation errors in non-privileged environments
      }
    }
    return c;
  });
}

const clientPromise: Promise<MongoClient> = globalWithMongo._mongoClientPromise;

export default clientPromise;
