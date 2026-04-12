const mongoose = require("mongoose");

/**
 * Connects to MongoDB using MONGO_URI (or legacy MONGODB_URI).
 * Call this once when your app starts, before listening on a port.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "Set MONGO_URI (or MONGODB_URI) in your environment (see .env.example)."
    );
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    throw err;
  }
}

module.exports = connectDB;
