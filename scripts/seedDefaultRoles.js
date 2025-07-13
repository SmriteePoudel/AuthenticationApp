import mongoose from "mongoose";
import Role from "../app/lib/models/Role.js";
import User from "../app/lib/models/User.js";
import bcrypt from "bcryptjs";
import {
  roles as allRoles,
  permissions as allPermissions,
} from "../app/lib/roles.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/my-auth-app";

async function seedRolesAndUsers() {
  await mongoose.connect(MONGODB_URI);

  for (const role of allRoles) {
    let r = await Role.findOne({ value: role.value });
    if (!r) {
      await Role.create(role);
      console.log(`Created role: ${role.label}`);
    } else {
      r.label = role.label;
      r.permissions = role.permissions;
      await r.save();
      console.log(`Updated role: ${role.label}`);
    }
  }

  const superadminEmail = "superadmin@example.com";
  let superadminRole = await Role.findOne({ value: "superadmin" });
  let superadmin = await User.findOne({ email: superadminEmail });
  if (!superadmin) {
    const hashed = await bcrypt.hash("superadmin123", 10);
    superadmin = await User.create({
      name: "Super Admin",
      email: superadminEmail,
      password: hashed,
      roles: [superadminRole._id],
      permissions: [...allPermissions],
    });
    console.log(
      "Superadmin user created: superadmin@example.com / superadmin123"
    );
  } else {
    superadmin.roles = [superadminRole._id];
    superadmin.permissions = [...allPermissions];
    await superadmin.save();
    console.log("Superadmin user updated.");
  }

  const userEmail = "user@example.com";
  let userRole = await Role.findOne({ value: "user" });
  let user = await User.findOne({ email: userEmail });
  if (!user) {
    const hashed = await bcrypt.hash("user12345", 10);
    user = await User.create({
      name: "Regular User",
      email: userEmail,
      password: hashed,
      roles: [userRole._id],
      permissions: userRole.permissions,
    });
    console.log("Regular user created: user@example.com / user12345");
  } else {
    user.roles = [userRole._id];
    user.permissions = userRole.permissions;
    await user.save();
    console.log("Regular user updated.");
  }
  await mongoose.disconnect();
}

seedRolesAndUsers().catch((err) => {
  console.error(err);
  process.exit(1);
});
