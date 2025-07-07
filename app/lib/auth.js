import bcrypt from "bcryptjs";
import "@/app/lib/mongoose";
import User from "@/app/lib/models/User.js";

export async function registerUser(email, password, name = null) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("User already exists");
  }

  const hashed = await bcrypt.hash(password, 10);

  const userName = name || email.split("@")[0];

  const user = await User.create({
    email,
    password: hashed,
    name: userName,
  });

  return {
    email: user.email,
    name: user.name,
    id: user._id,
  };
}

export async function authenticateUser(email, password) {
  const user = await User.findOne({ email }).populate("roles");
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isActive) {
    throw new Error("Account is deactivated");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error("Invalid credentials");
  }

  user.lastLogin = new Date();
  await user.save();

  return {
    email: user.email,
    name: user.name,
    id: user._id,
    roles: user.roles,
    permissions: user.permissions,
  };
}

export async function getUserById(id) {
  const user = await User.findById(id).populate("roles");
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export async function getUserByEmail(email) {
  const user = await User.findOne({ email }).populate("roles");
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}
