import mongoose from "mongoose";
import User from "./app/lib/models/User.js";
import Role from "./app/lib/models/Role.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/my-auth-app";

async function assignAdminRole() {
  await mongoose.connect(MONGODB_URI);

  const email = "admin@example.com";
  const password = "admin123";
  const name = "Admin User";
  const phone = "1234567890";

  let user = await User.findOne({ email });
  if (!user) {
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
  }

  const adminRole = await Role.findOne({ value: "admin" });
  if (!adminRole) {
    console.log("Admin role not found.");
    process.exit(1);
  }

  const users = await User.find({ email: /admin/i });
  console.log(
    "Users with 'admin' in email:",
    users.map((u) => u.email)
  );

  if (!user.roles.map((r) => r.toString()).includes(adminRole._id.toString())) {
    user.roles.push(adminRole._id);
    await user.save();
    console.log("Admin role assigned to admin@example.com");
  } else {
    console.log("User already has admin role.");
  }

  const updatedUser = await User.findOne({ email }).populate("roles");
  const userRolePermissions = updatedUser.roles.map((r) => ({
    value: r.value,
    permissions: r.permissions,
  }));
  console.log("admin@example.com roles and permissions:", userRolePermissions);
  console.log("admin@example.com direct permissions:", updatedUser.permissions);

  console.log("Admin role permissions:", adminRole.permissions);

  await mongoose.disconnect();
}

assignAdminRole();
