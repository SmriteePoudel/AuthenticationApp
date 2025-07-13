import mongoose from "mongoose";
import User from "./app/lib/models/User.js";
import Role from "./app/lib/models/Role.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/my-auth-app";

async function createRegularUser() {
  await mongoose.connect(MONGODB_URI);

  const email = "user@example.com";
  const password = "user123";
  const name = "Regular User";
  const phone = "1234567890";

  let user = await User.findOne({ email });
  if (user) {
    console.log("User already exists.");
    await mongoose.disconnect();
    return;
  }

  const userRole = await Role.findOne({ value: "user" });
  if (!userRole) {
    console.log("User role not found. Please seed roles first.");
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
    roles: [userRole._id],
  });

  console.log("User user@example.com created with 'user' role.");
  await mongoose.disconnect();
}

async function createAdminUser() {
  await mongoose.connect(MONGODB_URI);

  const email = "admin@example.com";
  const password = "admin123";
  const name = "Admin User";
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

  console.log("User admin@example.com created.");
  await mongoose.disconnect();
}

async function listAllUsers() {
  await mongoose.connect(MONGODB_URI);
  const users = await User.find({}).populate("roles");
  users.forEach((user) => {
    console.log({
      email: user.email,
      roles: user.roles.map((r) => r.value),
      permissions: user.permissions,
    });
  });
  await mongoose.disconnect();
}

createRegularUser();
createAdminUser();
listAllUsers();
