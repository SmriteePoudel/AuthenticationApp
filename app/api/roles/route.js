import db from "../../../lib/mongoose.js";
import { Role } from "../../../models/index.js";

export async function GET(request) {
  await db;
  const { searchParams } = new URL(request.url);
  if (searchParams.has("role")) {
    const roleValue = searchParams.get("role");
    const found = await Role.findOne({ value: roleValue });
    if (!found) {
      return new Response(JSON.stringify({ error: "Role not found" }), {
        status: 404,
      });
    }
    return Response.json(found.permissions || []);
  }
  const roles = await Role.find();
  return Response.json(roles);
}

export async function POST(request) {
  await db;
  const body = await request.json();
  if (!body.name) {
    return new Response(JSON.stringify({ error: "Role name is required" }), {
      status: 400,
    });
  }
  const value = body.name.toLowerCase().replace(/\s+/g, "_");
  const label = body.name;
  const permissions = Array.isArray(body.permissions) ? body.permissions : [];
  let role = await Role.findOne({ value });
  if (!role) {
    role = await Role.create({ value, label, permissions });
  } else {
    // Optionally update permissions if role already exists
    role.permissions = permissions;
    await role.save();
  }
  return Response.json(
    { value: role.value, label: role.label, permissions: role.permissions },
    { status: 201 }
  );
}

export async function PUT(request) {
  await db;
  try {
    const body = await request.json();
    const { roleId, name, permissions } = body;

    if (!roleId) {
      return Response.json({ error: "Role ID is required" }, { status: 400 });
    }

    const role = await Role.findById(roleId);
    if (!role) {
      return Response.json({ error: "Role not found" }, { status: 404 });
    }

    if (name !== undefined) {
      role.label = name;
      role.value = name.toLowerCase().replace(/\s+/g, "_");
    }

    if (permissions !== undefined) {
      role.permissions = Array.isArray(permissions) ? permissions : [];
    }

    await role.save();

    return Response.json({
      message: "Role updated successfully",
      role: {
        _id: role._id,
        value: role.value,
        label: role.label,
        permissions: role.permissions,
      },
    });
  } catch (error) {
    console.error("PUT /api/roles error:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  await db;
  try {
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get("roleId");

    console.log("DELETE /api/roles - Received roleId:", roleId);

    if (!roleId) {
      return Response.json({ error: "Role ID is required" }, { status: 400 });
    }

    const role = await Role.findById(roleId);
    if (!role) {
      console.log("Role not found with ID:", roleId);
      return Response.json({ error: "Role not found" }, { status: 404 });
    }

    console.log("Found role to delete:", role);

    const User = (await import("@/app/lib/models/User")).default;
    const usersWithRole = await User.find({ roles: roleId });

    console.log("Users with this role:", usersWithRole.length);

    if (usersWithRole.length > 0) {
      const userEmails = usersWithRole.map((user) => user.email).join(", ");
      return Response.json(
        {
          error: `Cannot delete role that is assigned to users: ${userEmails}`,
          users: userEmails,
        },
        { status: 400 }
      );
    }

    console.log("Deleting role:", role.value);

    const deleteResult = await Role.findByIdAndDelete(roleId);

    if (!deleteResult) {
      console.log("Role deletion failed - no document was deleted");
      return Response.json(
        { error: "Failed to delete role - role may have been already deleted" },
        { status: 500 }
      );
    }

    console.log("Role deleted successfully:", role.value);

    return Response.json({
      message: "Role deleted successfully",
      deletedRole: {
        _id: role._id,
        value: role.value,
        label: role.label,
      },
    });
  } catch (error) {
    console.error("DELETE /api/roles error:", error);

    // Handle specific MongoDB errors
    if (error.name === "CastError") {
      return Response.json(
        { error: "Invalid role ID format" },
        { status: 400 }
      );
    }

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return Response.json(
        { error: `Validation failed: ${validationErrors.join(", ")}` },
        { status: 400 }
      );
    }

    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
