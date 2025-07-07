"use client";
import React, { useState, useEffect } from "react";
import { roles as initialRoles } from "@/app/lib/roles";
import AccessDenied from "../components/AccessDenied";

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form, setForm] = useState({ name: "", permissions: [] });
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const roles = user?.user?.roles || user?.roles || [];
        if (roles.some((role) => role.value === "admin")) {
          setIsAdmin(true);
          return;
        }
      } catch {}
    }
    setIsAdmin(false);
  }, []);

  useEffect(() => {
    fetchRoles();
    if (showModal) {
      fetchPermissions();
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
    setAllPermissions(data);
  };

  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    const [resource, action] = perm.split(".");
    if (!acc[resource]) acc[resource] = [];
    acc[resource].push(action);
    return acc;
  }, {});

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

  if (isAdmin === null) return null;
  if (!isAdmin) return <AccessDenied />;

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center">Loading roles...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Roles Management</h2>
        <button
          className="bg-blue-600 text-black px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          Add New Role
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg text-black">
            <h3 className="text-lg font-semibold mb-4">Add New Role</h3>
            <input
              className="w-full border px-3 py-2 rounded mb-4 text-black placeholder-black"
              placeholder="Role name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div className="mb-4">
              <div className="font-medium mb-2">Permissions:</div>
              {Object.keys(groupedPermissions).map((resource) => (
                <div key={resource} className="mb-2">
                  <span className="font-semibold mr-2">
                    {resource.charAt(0).toUpperCase() + resource.slice(1)}:
                  </span>
                  {groupedPermissions[resource].map((action) => {
                    const perm = `${resource}.${action}`;
                    return (
                      <label
                        key={perm}
                        className="inline-flex items-center gap-1 text-black mr-4"
                      >
                        <input
                          type="checkbox"
                          checked={form.permissions.includes(perm)}
                          onChange={() => handleCheckbox(perm)}
                        />
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                      </label>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-400 text-black"
                onClick={handleDelete}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-black hover:bg-blue-700"
                onClick={handleSave}
                disabled={!form.name.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {editingRole && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg text-black">
            <h3 className="text-lg font-semibold mb-4">Edit Role</h3>
            <input
              className="w-full border px-3 py-2 rounded mb-4 text-black placeholder-black"
              placeholder="Role name"
              value={editingRole.name}
              onChange={(e) =>
                setEditingRole({ ...editingRole, name: e.target.value })
              }
            />
            <div className="mb-4">
              <div className="font-medium mb-2">Permissions:</div>
              {Object.keys(groupedPermissions).map((resource) => (
                <div key={resource} className="mb-2">
                  <span className="font-semibold mr-2">
                    {resource.charAt(0).toUpperCase() + resource.slice(1)}:
                  </span>
                  {groupedPermissions[resource].map((action) => {
                    const perm = `${resource}.${action}`;
                    return (
                      <label
                        key={perm}
                        className="inline-flex items-center gap-1 text-black mr-4"
                      >
                        <input
                          type="checkbox"
                          checked={editingRole.permissions.includes(perm)}
                          onChange={() => handleEditCheckbox(perm)}
                        />
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                      </label>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                onClick={handleSaveEdit}
                disabled={!editingRole.name.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <table className="min-w-full bg-gray-700 border border-black mt-4">
        <thead className="bg-blue-700">
          <tr>
            <th className="py-2 px-4 border">Role</th>
            <th className="py-2 px-4 border">Permissions</th>
            <th className="py-2 px-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.length === 0 ? (
            <tr>
              <td colSpan="3" className="py-4 px-4 border text-center">
                No roles found
              </td>
            </tr>
          ) : (
            roles.map((role, index) => (
              <tr key={`${role.value}-${role._id || index}`}>
                <td className="py-2 px-4 border font-semibold">
                  {isEditing(role._id) ? (
                    <input
                      type="text"
                      value={editingRole.name}
                      onChange={(e) =>
                        setEditingRole({ ...editingRole, name: e.target.value })
                      }
                      className="w-full p-1 text-black rounded"
                    />
                  ) : (
                    role.label
                  )}
                </td>
                <td className="py-2 px-4 border text-center">
                  {isEditing(role._id) ? (
                    <div className="text-xs">
                      {editingRole.permissions.length > 0
                        ? editingRole.permissions.join(", ")
                        : "-"}
                    </div>
                  ) : role.permissions && role.permissions.length > 0 ? (
                    role.permissions.join(", ")
                  ) : (
                    "-"
                  )}
                </td>
                <td className="py-2 px-4 border">
                  {isEditing(role._id) ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditRole(role)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                      >
                        Delete
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
  );
}
