import db from "../../../lib/mongoose.js";

const DEFAULT_PERMISSIONS = [
  {
    name: "user.create",
    description: "Create new users",
    category: "user",
    isDefault: true,
  },
  {
    name: "user.read",
    description: "View user information",
    category: "user",
    isDefault: true,
  },
  {
    name: "user.update",
    description: "Update user information",
    category: "user",
    isDefault: true,
  },
  {
    name: "user.delete",
    description: "Delete users",
    category: "user",
    isDefault: true,
  },
  {
    name: "role.create",
    description: "Create new roles",
    category: "role",
    isDefault: true,
  },
  {
    name: "role.read",
    description: "View role information",
    category: "role",
    isDefault: true,
  },
  {
    name: "role.update",
    description: "Update role information",
    category: "role",
    isDefault: true,
  },
  {
    name: "role.delete",
    description: "Delete roles",
    category: "role",
    isDefault: true,
  },
  {
    name: "permission.create",
    description: "Create new permissions",
    category: "permission",
    isDefault: true,
  },
  {
    name: "permission.read",
    description: "View permission information",
    category: "permission",
    isDefault: true,
  },
  {
    name: "permission.update",
    description: "Update permission information",
    category: "permission",
    isDefault: true,
  },
  {
    name: "permission.delete",
    description: "Delete permissions",
    category: "permission",
    isDefault: true,
  },
  {
    name: "system.admin",
    description: "System administration access",
    category: "system",
    isDefault: true,
  },
  {
    name: "system.superadmin",
    description: "Superadmin access",
    category: "system",
    isDefault: true,
  },
];

export async function GET() {
  await db;

  try {
    // For now, return the default permissions as a simple array
    // This will be enhanced later with database storage
    const permissions = DEFAULT_PERMISSIONS.map((perm, index) => ({
      _id: `perm_${index}`,
      name: perm.name,
      description: perm.description,
      category: perm.category,
      isDefault: perm.isDefault,
      isActive: true,
    }));

    return Response.json(permissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return Response.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  await db;

  try {
    const body = await request.json();
    if (!body.name) {
      return Response.json(
        { error: "Permission name is required" },
        { status: 400 }
      );
    }

    // For now, just return success (database implementation will be added later)
    const newPermission = {
      _id: `perm_${Date.now()}`,
      name: body.name.toLowerCase(),
      description: body.description || "",
      category: body.category || "other",
      isDefault: false,
      isActive: true,
    };

    return Response.json(newPermission, { status: 201 });
  } catch (error) {
    console.error("Error creating permission:", error);
    return Response.json(
      { error: "Failed to create permission" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  await db;

  try {
    const { id } = await request.json();

    if (!id) {
      return Response.json(
        { error: "Permission ID is required" },
        { status: 400 }
      );
    }

    // For now, just return success (database implementation will be added later)
    console.log("Deleting permission with ID:", id);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting permission:", error);
    return Response.json(
      { error: "Failed to delete permission" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  await db;

  try {
    const { id, name, description, category } = await request.json();

    if (!id) {
      return Response.json(
        { error: "Permission ID is required" },
        { status: 400 }
      );
    }

    if (!name) {
      return Response.json(
        { error: "Permission name is required" },
        { status: 400 }
      );
    }

    // For now, just return success (database implementation will be added later)
    const updatedPermission = {
      _id: id,
      name: name.toLowerCase(),
      description: description || "",
      category: category || "other",
      isDefault: false,
      isActive: true,
    };

    return Response.json(updatedPermission);
  } catch (error) {
    console.error("Error updating permission:", error);
    return Response.json(
      { error: "Failed to update permission" },
      { status: 500 }
    );
  }
}
