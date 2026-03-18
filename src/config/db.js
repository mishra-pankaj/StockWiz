import mongoose from "mongoose";

export async function connectDB(MONGODB_URI) {
  const uri = MONGODB_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/stockwiseDB";

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully.");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}
