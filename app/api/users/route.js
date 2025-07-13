import db from "../../../lib/mongoose.js";
import { User, Role } from "../../../models/index.js";
import bcrypt from "bcryptjs";
import {
  roles as allRoles,
  permissions as allPermissions,
} from "../../lib/roles.js";

let users = [];
let nextId = 1;

export async function GET() {
  await db;
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
      let permissions;
      if (roleDocs.some((r) => r.value === "superadmin")) {
        permissions = [...allPermissions];
      } else {
        permissions = Array.from(
          new Set(roleDocs.flatMap((r) => r.permissions))
        );
      }
      const user = await User.create({
        name,
        email,
        phone,
        password: hashed,
        roles: roleIds,
        permissions,
      });
      const populatedUser = await User.findById(user._id).populate("roles");
      return Response.json({ message: "User created", user: populatedUser });
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

export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, name, email, phone, roles } = body;

    console.log("PUT /api/users - Received data:", {
      userId,
      name,
      email,
      phone,
      roles,
    });

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Found user:", user);

    if (name !== undefined && name !== null) {
      if (name.trim().length < 2) {
        return Response.json(
          { error: "Name must be at least 2 characters long" },
          { status: 400 }
        );
      }
      user.name = name.trim();
    }

    if (email !== undefined && email !== null) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        return Response.json(
          { error: "Please enter a valid email address" },
          { status: 400 }
        );
      }

      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: userId },
      });
      if (existingUser) {
        return Response.json(
          { error: "Email is already taken by another user" },
          { status: 400 }
        );
      }

      user.email = email.toLowerCase().trim();
    }

    if (phone !== undefined && phone !== null) {
      if (phone.trim() !== "") {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(phone.trim())) {
          return Response.json(
            { error: "Please enter a valid phone number" },
            { status: 400 }
          );
        }
      }
      user.phone = phone.trim();
    }

    if (roles && Array.isArray(roles)) {
      console.log("Updating roles:", roles);
      const roleDocs = await Role.find({ _id: { $in: roles } });
      console.log("Found role documents:", roleDocs);

      if (roleDocs.length > 0) {
        user.roles = roleDocs.map((r) => r._id);

        let permissions;
        if (roleDocs.some((r) => r.value === "superadmin")) {
          permissions = [...allPermissions];
        } else {
          permissions = Array.from(
            new Set(roleDocs.flatMap((r) => r.permissions))
          );
        }
        user.permissions = permissions;
        console.log("Updated permissions:", permissions);
      } else {
        user.roles = [];
        user.permissions = [];
      }
    }

    console.log("Saving user with data:", {
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      permissions: user.permissions,
    });

    await user.save();
    const updatedUser = await User.findById(userId).populate("roles");

    return Response.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("PUT /api/users error:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return Response.json(
        { error: `Validation failed: ${validationErrors.join(", ")}` },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return Response.json(
        { error: "Email is already taken by another user" },
        { status: 400 }
      );
    }

    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    await User.findByIdAndDelete(userId);

    return Response.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/users error:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
