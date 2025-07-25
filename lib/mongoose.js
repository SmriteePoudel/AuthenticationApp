import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/my-auth-app";

if (!global._mongoose) {
  global._mongoose = mongoose.connect(MONGODB_URI);
}

export default global._mongoose;
