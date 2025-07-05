const mongoose = require("mongoose");
const Role = require("../app/lib/models/Role").default;

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/my-auth-app";

const defaultRoles = [
  {
    value: "admin",
    label: "Admin",
    permissions: ["create", "read", "update", "delete"],
  },
  {
    value: "user",
    label: "User",
    permissions: ["read"],
  },
  {
    value: "manager",
    label: "Manager",
    permissions: ["read", "update"],
  },
  {
    value: "editor",
    label: "Editor",
    permissions: ["read", "update", "create"],
  },
  {
    value: "blogger",
    label: "Blogger",
    permissions: ["read", "create"],
  },
];

async function seedRoles() {
  await mongoose.connect(MONGODB_URI);
  for (const role of defaultRoles) {
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
  await mongoose.disconnect();
}

seedRoles().catch((err) => {
  console.error(err);
  process.exit(1);
});
