import mongoose from "mongoose";
import Role from "../app/lib/models/Role.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/my-auth-app";

async function seedAdminRole() {
  await mongoose.connect(MONGODB_URI);

  let admin = await Role.findOne({ value: "admin" });
  if (!admin) {
    admin = await Role.create({
      value: "admin",
      label: "Admin",
      permissions: ["create", "read", "update", "delete"],
    });
    console.log("Admin role created.");
  } else {
    admin.permissions = ["create", "read", "update", "delete"];
    await admin.save();
    console.log("Admin role updated with all permissions.");
  }
  await mongoose.disconnect();
}

seedAdminRole().catch(console.error);
