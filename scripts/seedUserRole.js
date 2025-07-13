import mongoose from "mongoose";
import Role from "../app/lib/models/Role.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/my-auth-app";

async function seedUserRole() {
  await mongoose.connect(MONGODB_URI);

  let userRole = await Role.findOne({ value: "user" });
  if (!userRole) {
    userRole = await Role.create({
      value: "user",
      label: "User",
      permissions: ["read"],
    });
    console.log("User role created.");
  } else {
    userRole.label = "User";
    userRole.permissions = ["read"];
    await userRole.save();
    console.log("User role updated with permissions.");
  }
  await mongoose.disconnect();
}

seedUserRole().catch(console.error);
