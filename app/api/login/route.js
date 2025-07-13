import db from "../../../lib/mongoose.js";
import { User } from "../../../models/index.js";
import { authenticateUser } from "../../lib/auth.js";

export async function POST(request) {
  await db;
  const { email, password } = await request.json();

  try {
    await db;

    const populatedUser = await User.findOne({ email }).populate({
      path: "roles",
      select: "value label permissions",
    });
    if (!populatedUser) {
      return Response.json({ message: "User not found" }, { status: 401 });
    }

    const bcrypt = await import("bcryptjs");
    const match = await bcrypt.default.compare(
      password,
      populatedUser.password
    );
    if (!match) {
      return Response.json({ message: "Invalid credentials" }, { status: 401 });
    }

    populatedUser.lastLogin = new Date();
    await populatedUser.save();

    let permissions = populatedUser.permissions || [];
    const { permissions: allPermissions } = await import("../../lib/roles.js");

    if ((!permissions || permissions.length === 0) && populatedUser.roles) {
      if (populatedUser.roles.some((r) => r.value === "superadmin")) {
        permissions = [...allPermissions];
      } else {
        permissions = Array.from(
          new Set(populatedUser.roles.flatMap((r) => r.permissions || []))
        );
      }
    }

    if (
      (!populatedUser.permissions || populatedUser.permissions.length === 0) &&
      populatedUser.roles
    ) {
      if (populatedUser.roles.some((r) => r.value === "superadmin")) {
        populatedUser.permissions = [...allPermissions];
      } else {
        populatedUser.permissions = Array.from(
          new Set(populatedUser.roles.flatMap((r) => r.permissions || []))
        );
      }
      await populatedUser.save();
    }
    const userResponse = { ...populatedUser.toObject(), permissions };
    console.log("DEBUG: Login API - User response:", {
      _id: userResponse._id,
      email: userResponse.email,
      roles: userResponse.roles,
      rolesLength: userResponse.roles ? userResponse.roles.length : 0,
      permissions: userResponse.permissions,
      permissionsLength: userResponse.permissions
        ? userResponse.permissions.length
        : 0,
    });
    console.log(
      "DEBUG: Login API - Roles details:",
      userResponse.roles?.map((r) => ({
        _id: r._id,
        value: r.value,
        label: r.label,
      }))
    );

    return Response.json({
      message: "Login successful",
      user: userResponse,
    });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 401 });
  }
}
