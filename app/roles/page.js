"use client";
import React, { useState, useEffect } from "react";
import { roles as initialRoles } from "@/app/lib/roles";
import AccessDenied from "../components/AccessDenied";
import { useRouter } from "next/navigation";

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form, setForm] = useState({ name: "", permissions: [] });
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchRoles();
    if (showModal) {
      fetchPermissions();
    }
    if (typeof window !== "undefined") {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const roles = user?.roles || [];
        const isSuperadminRole = roles.some(
          (role) => role.value === "superadmin" || role === "superadmin"
        );
        const isAdminRole = roles.some(
          (role) => role.value === "admin" || role === "admin"
        );
        const isSuperadminByEmail = user?.email === "superadmin@example.com";

        if (isSuperadminRole || isSuperadminByEmail) {
          setIsSuperadmin(true);
          setHasFullAccess(true);
        } else if (isAdminRole) {
          setIsAdmin(true);
          setHasFullAccess(true);
        } else {
          // Give all users full access to roles management
          setHasFullAccess(true);
        }
      } catch (error) {
        console.error("Error checking user roles:", error);
        setHasFullAccess(true); // Default to full access
      }
    }
  }, [showModal]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/roles");
      if (res.ok) {
        const data = await res.json();
        console.log("Fetched roles data:", data);

        const uniqueRoles = data.reduce((acc, role) => {
          if (!acc.find((r) => r.value === role.value)) {
            acc.push(role);
          }
          return acc;
        }, []);

        console.log("Processed unique roles:", uniqueRoles);
        setRoles(uniqueRoles);
      } else {
        console.log("Failed to fetch roles, using initial roles");
        setRoles(initialRoles);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles(initialRoles);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    const res = await fetch("/api/permissions");
    let data = await res.json();
    if (!Array.isArray(data)) data = [];
    console.log("Fetched permissions data:", data);
    setAllPermissions(data);
  };

  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    // Handle both string permissions and permission objects
    const permName = typeof perm === "string" ? perm : perm.name;
    if (!permName || typeof permName !== "string") {
      console.warn("Invalid permission:", perm);
      return acc;
    }

    const [resource, action] = permName.split(".");
    if (!resource || !action) {
      console.warn("Invalid permission format:", permName);
      return acc;
    }

    if (!acc[resource]) acc[resource] = [];
    acc[resource].push(action);
    return acc;
  }, {});

  console.log("Grouped permissions:", groupedPermissions);

  const handleCheckbox = (perm) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const handleEditCheckbox = (perm) => {
    setEditingRole((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;

    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          permissions: form.permissions,
        }),
      });

      if (res.ok) {
        await fetchRoles();
        setForm({ name: "", permissions: [] });
        setShowModal(false);
      } else {
        alert("Failed to create role");
      }
    } catch (error) {
      console.error("Error creating role:", error);
      alert("Error creating role");
    }
  };

  const handleDelete = () => {
    setForm({ name: "", permissions: [] });
    setShowModal(false);
  };

  const handleEditRole = (role) => {
    setEditingRole({
      _id: role._id,
      name: role.label,
      permissions: role.permissions || [],
    });
    fetchPermissions();
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch("/api/roles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleId: editingRole._id,
          name: editingRole.name,
          permissions: editingRole.permissions,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert("Failed to update role: " + (errorData.error || res.statusText));
        return;
      }

      await fetchRoles();
      setEditingRole(null);
    } catch (error) {
      alert("An error occurred: " + error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
  };

  const handleDeleteRole = async (roleId) => {
    if (!confirm("Are you sure you want to delete this role?")) {
      return;
    }

    try {
      console.log("Attempting to delete role with ID:", roleId);

      const res = await fetch(`/api/roles?roleId=${roleId}`, {
        method: "DELETE",
      });

      const responseData = await res.json();
      console.log("Delete response:", responseData);

      if (!res.ok) {
        alert(
          "Failed to delete role: " + (responseData.error || res.statusText)
        );
        return;
      }

      console.log("Role deleted successfully");
      await fetchRoles();
    } catch (error) {
      console.error("Error deleting role:", error);
      alert("An error occurred: " + error.message);
    }
  };

  const isEditing = (roleId) => editingRole && editingRole._id === roleId;

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center">Loading roles...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <button
        className="mb-4 px-4 py-2 rounded bg-gray-500 text-white font-bold hover:bg-gray-600"
        onClick={() => {
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Roles Management</h2>
        {hasFullAccess && (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold"
            onClick={() => {
              setShowModal(true);
              fetchPermissions();
            }}
          >
            + Add New Role
          </button>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg text-black">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Role</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setForm({ name: "", permissions: [] });
                }}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Role Name:
              </label>
              <input
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter role name (e.g., 'Manager', 'Editor')"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Permissions:
              </label>
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded p-3">
                {Object.keys(groupedPermissions).map((resource) => (
                  <div key={resource} className="mb-3 p-2 bg-gray-50 rounded">
                    <div className="font-semibold text-sm mb-2 text-blue-600">
                      {resource.charAt(0).toUpperCase() + resource.slice(1)}:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {groupedPermissions[resource].map((action) => {
                        const perm = `${resource}.${action}`;
                        return (
                          <label
                            key={perm}
                            className="inline-flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-100 p-1 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={form.permissions.includes(perm)}
                              onChange={() => handleCheckbox(perm)}
                              className="rounded"
                            />
                            <span>
                              {action.charAt(0).toUpperCase() + action.slice(1)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Selected: {form.permissions.length} permission(s)
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 transition-colors"
                onClick={() => {
                  setShowModal(false);
                  setForm({ name: "", permissions: [] });
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                onClick={handleSave}
                disabled={!form.name.trim()}
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      {editingRole && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg text-black">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Edit Role: {editingRole.name}
              </h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Role Name:
              </label>
              <input
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter role name"
                value={editingRole.name}
                onChange={(e) =>
                  setEditingRole({ ...editingRole, name: e.target.value })
                }
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Permissions:
              </label>
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded p-3">
                {Object.keys(groupedPermissions).map((resource) => (
                  <div key={resource} className="mb-3 p-2 bg-gray-50 rounded">
                    <div className="font-semibold text-sm mb-2 text-blue-600">
                      {resource.charAt(0).toUpperCase() + resource.slice(1)}:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {groupedPermissions[resource].map((action) => {
                        const perm = `${resource}.${action}`;
                        return (
                          <label
                            key={perm}
                            className="inline-flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-100 p-1 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={editingRole.permissions.includes(perm)}
                              onChange={() => handleEditCheckbox(perm)}
                              className="rounded"
                            />
                            <span>
                              {action.charAt(0).toUpperCase() + action.slice(1)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Selected: {editingRole.permissions.length} permission(s)
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 transition-colors"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition-colors disabled:bg-gray-400"
                onClick={handleSaveEdit}
                disabled={!editingRole.name.trim()}
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            All Roles ({roles.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions ({allPermissions.length} total)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <div className="text-4xl mb-2">📋</div>
                      <div className="text-lg font-medium">No roles found</div>
                      <div className="text-sm">
                        Create your first role to get started
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                roles.map((role, index) => (
                  <tr
                    key={`${role.value}-${role._id || index}`}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {role.label
                                ? role.label.charAt(0).toUpperCase()
                                : "R"}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {isEditing(role._id) ? (
                              <input
                                type="text"
                                value={editingRole.name}
                                onChange={(e) =>
                                  setEditingRole({
                                    ...editingRole,
                                    name: e.target.value,
                                  })
                                }
                                className="w-full p-1 border border-gray-300 rounded text-sm"
                              />
                            ) : (
                              role.label
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {role.description || "No description"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {role.value}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {isEditing(role._id) ? (
                          <div className="text-xs text-gray-600">
                            {editingRole.permissions.length > 0
                              ? `${editingRole.permissions.length} permission(s) selected`
                              : "No permissions selected"}
                          </div>
                        ) : role.permissions && role.permissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 3).map((perm, idx) => (
                              <span
                                key={idx}
                                className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                              >
                                {perm}
                              </span>
                            ))}
                            {role.permissions.length > 3 && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                +{role.permissions.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            No permissions
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isEditing(role._id) ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={handleSaveEdit}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            ✓ Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            ✕ Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEditRole(role)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role._id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
