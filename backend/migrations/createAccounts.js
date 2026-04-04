import mongoose from "mongoose";
import "dotenv/config";
import Account from "../models/Account.js";

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set in your environment.");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    // Optional options; mongoose 6+ has good defaults.
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  });

  console.log("Connected to MongoDB, running accounts migration...");

  try {
    // Ensure the collection exists and indexes are created.
    await Account.init();
    console.log("Accounts collection is ready (indexes created).");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
