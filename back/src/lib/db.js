import mongoose from "mongoose";

export async function cnnectDB() {
  try {
    const mongoUrl = process.env.DB_URL;

    if (!mongoUrl) {
      throw new Error("MONGO_URL is Required");
    }
    const conn = await mongoose.connect(mongoUrl);
    console.log("MongoDB connected", conn.connection.host);
  } catch (error) {
    console.error("ongoDB Connection Error:", error.message);
    process.exit(1)
  }
}
