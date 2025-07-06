import "@/app/lib/mongoose";
import User from "@/app/lib/models/User";
import Role from "@/app/lib/models/Role";
import bcrypt from "bcryptjs";

let users = [];
let nextId = 1;

export async function GET() {
  const users = await User.find().populate("roles");
  return Response.json(users);
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.action) {
      const { name, email, phone, password, roles } = body;
      if (!email || !password) {
        return Response.json(
          { error: "Email and password are required" },
          { status: 400 }
        );
      }
      const existing = await User.findOne({ email });
      if (existing) {
        return Response.json({ error: "User already exists" }, { status: 400 });
      }
      const hashed = await bcrypt.hash(password || "changeme", 10);

      console.log("Received roles from frontend:", roles);
      const roleDocs = await Role.find({ _id: { $in: roles } });
      console.log("Found roleDocs:", roleDocs);
      if (!roleDocs.length) {
        return Response.json(
          { error: "No valid roles found for user." },
          { status: 400 }
        );
      }
      const roleIds = roleDocs.map((r) => r._id);
      const permissions = Array.from(
        new Set(roleDocs.flatMap((r) => r.permissions))
      );
      const user = await User.create({
        name,
        email,
        phone,
        password: hashed,
        roles: roleIds,
        permissions,
      });
      return Response.json({ message: "User created", user });
    }

    // Existing assign-role and check-permission logic
    const { action, email, roleValue, permission } = body;

    if (action === "assign-role") {
      if (!email || !roleValue) {
        return Response.json(
          { error: "Email and roleValue are required" },
          { status: 400 }
        );
      }
      const user = await User.findOne({ email });
      const role = await Role.findOne({ value: roleValue });
      if (!user || !role) {
        return Response.json(
          { error: "User or role not found" },
          { status: 404 }
        );
      }
      if (!user.roles.includes(role._id)) {
        user.roles.push(role._id);
        await user.save();
      }
      return Response.json({
        message: `Role '${roleValue}' assigned to user '${email}'`,
      });
    }

    if (action === "check-permission") {
      if (!email || !permission) {
        return Response.json(
          { error: "Email and permission are required" },
          { status: 400 }
        );
      }
      const user = await User.findOne({ email }).populate("roles");
      if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }
      const userPermissions = new Set();
      user.roles.forEach((role) => {
        (role.permissions || []).forEach((p) => userPermissions.add(p));
      });
      const hasPermission = userPermissions.has(permission);
      return Response.json({ hasPermission });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/users error:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
