import db from "../../../lib/mongoose.js";
import { User } from "../../../models/index.js";
import { authenticateUser } from "../../lib/auth.js";

export async function POST(request) {
  await db;
  const { email, password } = await request.json();

  try {
    await db;

    const populatedUser = await User.findOne({ email }).populate("roles");
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
    return Response.json({
      message: "Login successful",
      user: { ...populatedUser.toObject(), permissions },
    });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 401 });
  }
}
