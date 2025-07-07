import mongoose from "mongoose";
import User from "./app/lib/models/User.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/my-auth-app";

async function createSuperAdminUser() {
  await mongoose.connect(MONGODB_URI);

  const email = "superadmin@example.com";
  const password = "superadmin123";
  const name = "Super Admin";
  const phone = "1234567890";

  let user = await User.findOne({ email });
  if (user) {
    console.log("User already exists.");
    await mongoose.disconnect();
    return;
  }

  const bcrypt = await import("bcryptjs");
  const hashed = await bcrypt.default.hash(password, 10);

  user = await User.create({
    name,
    email,
    phone,
    password: hashed,
    roles: [],
  });

  console.log("User superadmin@example.com created.");
  await mongoose.disconnect();
}

createSuperAdminUser();
