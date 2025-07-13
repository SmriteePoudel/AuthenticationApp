"use client";
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSave } from "react-icons/fa";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/app/components/ConfirmModal";
import { roles as allRoles } from "@/app/lib/roles";

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState([]);
  const [editingPermission, setEditingPermission] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "other",
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(null);
  const [confirmPermission, setConfirmPermission] = useState(null);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPermission, setNewPermission] = useState({
    name: "",
    description: "",
    category: "other",
  });
  const router = useRouter();

  useEffect(() => {
    fetchPermissions();
    if (typeof window !== "undefined") {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const roles = user?.roles || [];
        console.log("DEBUG: Permissions page - User:", user);
        console.log("DEBUG: Permissions page - Roles:", roles);

        const isSuperadminByRole = roles.some(
          (role) => role.value === "superadmin" || role === "superadmin"
        );

        const isSuperadminByEmail = user?.email === "superadmin@example.com";

        if (isSuperadminByRole || isSuperadminByEmail) {
          console.log("DEBUG: Permissions page - Superadmin access granted");
          setIsSuperadmin(true);
          return;
        }
      } catch (error) {
        console.error("Error checking superadmin access:", error);
      }
    }
    setIsSuperadmin(false);
  }, []);

  const fetchPermissions = async () => {
    const res = await fetch("/api/permissions");
    let data = await res.json();
    if (!Array.isArray(data)) {
      data = [];
    }
    setPermissions(data);
  };

  const handleEdit = (permission) => {
    setEditingPermission(permission);
    setEditForm({
      name: permission.name,
      description: permission.description || "",
      category: permission.category || "other",
    });
  };

  const handleEditSave = async (permissionId) => {
    try {
      const response = await fetch("/api/permissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: permissionId,
          name: editForm.name,
          description: editForm.description,
          category: editForm.category,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert("Failed to update permission: " + error.error);
        return;
      }

      await fetchPermissions();
      setEditingPermission(null);
      setEditForm({ name: "", description: "", category: "other" });
    } catch (error) {
      console.error("Error updating permission:", error);
      alert("Failed to update permission");
    }
  };

  const handleDeleteClick = (permission) => {
    setConfirmType("delete");
    setConfirmPermission(permission);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (confirmType === "delete") {
      await handleDelete(confirmPermission._id);
    }
    setConfirmOpen(false);
    setConfirmType(null);
    setConfirmPermission(null);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setConfirmType(null);
    setConfirmPermission(null);
  };

  const handleDelete = async (permissionId) => {
    try {
      const response = await fetch("/api/permissions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: permissionId }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert("Failed to delete permission: " + error.error);
        return;
      }

      await fetchPermissions();
    } catch (error) {
      console.error("Error deleting permission:", error);
      alert("Failed to delete permission");
    }
  };

  const handleAddPermission = async () => {
    try {
      const response = await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPermission),
      });

      if (!response.ok) {
        const error = await response.json();
        alert("Failed to add permission: " + error.error);
        return;
      }

      await fetchPermissions();
      setNewPermission({ name: "", description: "", category: "other" });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding permission:", error);
      alert("Failed to add permission");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 border rounded shadow">
      <button
        className="mb-4 px-4 py-2 rounded bg-gray-500 text-white font-bold hover:bg-gray-600"
        onClick={() => {
          // Check if user is admin/superadmin and redirect accordingly
          if (typeof window !== "undefined") {
            try {
              const user = JSON.parse(localStorage.getItem("user"));
              const roles = user?.roles || [];
              const isSuperadmin = roles.some(
                (role) => role.value === "superadmin" || role === "superadmin"
              );
              const isAdmin = roles.some(
                (role) => role.value === "admin" || role === "admin"
              );
              const isSuperadminByEmail =
                user?.email === "superadmin@example.com";

              if (isSuperadmin || isSuperadminByEmail) {
                router.push("/admin-dashboard/superadmin");
              } else if (isAdmin) {
                router.push("/admin-dashboard");
              } else {
                router.push("/user-dashboard");
              }
            } catch (error) {
              router.push("/user-dashboard");
            }
          } else {
            router.push("/user-dashboard");
          }
        }}
      >
        Back to Dashboard
      </button>
      <h1 className="text-2xl font-bold mb-4">Permissions</h1>
      <p className="text-m font-sans mb-6">Here is a list of permissions</p>
      {isSuperadmin ? (
        <div className="mb-6">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "Cancel" : "+ Add New Permission"}
          </button>

          {showAddForm && (
            <div className="mt-4 p-4 bg-gray-800 rounded border border-gray-600">
              <h3 className="text-lg font-semibold mb-3 text-white">
                Add New Permission
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Permission Name"
                  value={newPermission.name}
                  onChange={(e) =>
                    setNewPermission({ ...newPermission, name: e.target.value })
                  }
                  className="p-2 border border-gray-600 rounded bg-gray-700 text-white"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newPermission.description}
                  onChange={(e) =>
                    setNewPermission({
                      ...newPermission,
                      description: e.target.value,
                    })
                  }
                  className="p-2 border border-gray-600 rounded bg-gray-700 text-white"
                />
                <select
                  value={newPermission.category}
                  onChange={(e) =>
                    setNewPermission({
                      ...newPermission,
                      category: e.target.value,
                    })
                  }
                  className="p-2 border border-gray-600 rounded bg-gray-700 text-white"
                >
                  <option value="user">User</option>
                  <option value="role">Role</option>
                  <option value="permission">Permission</option>
                  <option value="system">System</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button
                onClick={handleAddPermission}
                disabled={!newPermission.name}
                className="bg-green-500 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded"
              >
                Add Permission
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-red-500 mb-4">
          Only superadmin can manage permissions
        </p>
      )}
      <table className="min-w-full table-fixed bg-black border border-gray-700 rounded">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-700 text-left text-white">
              Permission Name
            </th>
            <th className="py-2 px-4 border-b border-gray-700 text-left text-white">
              Description
            </th>
            <th className="py-2 px-4 border-b border-gray-700 text-left text-white">
              Category
            </th>
            <th className="py-2 px-4 border-b border-gray-700 text-left text-white">
              Type
            </th>
            <th className="py-2 px-4 border-b border-gray-700 text-left text-white">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((perm) => (
            <tr key={perm._id} className="hover:bg-gray-800">
              <td className="py-2 px-4 border-b border-gray-700 text-white">
                {editingPermission?._id === perm._id ? (
                  <input
                    className="bg-gray-900 text-white border border-gray-600 rounded px-2 py-1 w-full"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    autoFocus
                  />
                ) : (
                  perm.name
                )}
              </td>
              <td className="py-2 px-4 border-b border-gray-700 text-white">
                {editingPermission?._id === perm._id ? (
                  <input
                    className="bg-gray-900 text-white border border-gray-600 rounded px-2 py-1 w-full"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                  />
                ) : (
                  perm.description || "-"
                )}
              </td>
              <td className="py-2 px-4 border-b border-gray-700 text-white">
                {editingPermission?._id === perm._id ? (
                  <select
                    className="bg-gray-900 text-white border border-gray-600 rounded px-2 py-1 w-full"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                  >
                    <option value="user">User</option>
                    <option value="role">Role</option>
                    <option value="permission">Permission</option>
                    <option value="system">System</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      perm.category === "user"
                        ? "bg-blue-600"
                        : perm.category === "role"
                        ? "bg-green-600"
                        : perm.category === "permission"
                        ? "bg-purple-600"
                        : perm.category === "system"
                        ? "bg-red-600"
                        : "bg-gray-600"
                    }`}
                  >
                    {perm.category}
                  </span>
                )}
              </td>
              <td className="py-2 px-4 border-b border-gray-700 text-white">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    perm.isDefault ? "bg-yellow-600" : "bg-gray-600"
                  }`}
                >
                  {perm.isDefault ? "Default" : "Custom"}
                </span>
              </td>
              <td className="py-2 px-4 border-b border-gray-700">
                <div className="flex flex-row gap-4 items-center">
                  {editingPermission?._id === perm._id ? (
                    <>
                      <button
                        title="Save"
                        className="text-green-500 hover:text-green-700"
                        onClick={() => handleEditSave(perm._id)}
                      >
                        <FaSave />
                      </button>
                      <button
                        title="Cancel"
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setEditingPermission(null)}
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <button
                      title="Edit"
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => handleEdit(perm)}
                    >
                      <FaEdit />
                    </button>
                  )}
                  <button
                    title="Delete"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteClick(perm)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ConfirmModal
        open={confirmOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        message={
          confirmType === "delete"
            ? `Are you sure you want to delete the permission "${confirmPermission?.name}"?`
            : "Are you sure you want to perform this action?"
        }
      />
    </div>
  );
}
