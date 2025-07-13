"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AccessDenied from "../components/AccessDenied";

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    roles: [],
  });
  const [rolePermissions, setRolePermissions] = useState([]);
  const [isSuperadmin, setIsSuperadmin] = useState(false);

  let currentUserRoles = [];
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log("DEBUG: user from localStorage", user);

        if (Array.isArray(user.roles)) {
          currentUserRoles = user.roles.map(
            (r) => r.value || r.label || r._id || r
          );
        }
        console.log("DEBUG: currentUserRoles", currentUserRoles);
      } catch (e) {
        currentUserRoles = [];
      }
    }
  }

  const currentPermissions = Array.from(
    new Set(
      currentUserRoles.flatMap((role) => {
        const found = roles.find((r) => r.value === role);
        if (found) return found.permissions;

        if (role === "admin") return ["create", "read", "update", "delete"];
        return [];
      })
    )
  );
  const router = useRouter();

  const defaultRoles = [
    { value: "admin", label: "Admin" },
    { value: "user", label: "User" },
    { value: "manager", label: "Manager" },
    { value: "editor", label: "Editor" },
  ];

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    const fetchPermissionsForRoles = async () => {
      if (form.roles.length === 0) {
        setRolePermissions([]);
        return;
      }
      const permsSet = new Set();
      for (const role of form.roles) {
        const res = await fetch(`/api/roles?role=${role}`);
        if (res.ok) {
          const perms = await res.json();
          perms.forEach((p) => permsSet.add(p));
        }
      }
      setRolePermissions(Array.from(permsSet));
    };
    fetchPermissionsForRoles();
  }, [form.roles]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const roles = user?.roles || [];
        if (
          roles.some(
            (role) => role.value === "superadmin" || role === "superadmin"
          )
        ) {
          setIsSuperadmin(true);
          return;
        }
      } catch {}
    }
    setIsSuperadmin(false);
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  };

  const fetchRoles = async () => {
    const res = await fetch("/api/roles");
    const data = await res.json();
    setRoles(data);
  };

  const handleOpenModal = () => {
    setShowModal(true);
    fetchRoles();
  };

  const handleAddUser = async () => {
    try {
      const selectedRoleIds = roles
        .filter((role) => form.roles.includes(role.value))
        .map((role) => role._id);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, roles: selectedRoleIds }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert("Failed to create user: " + (errorData.error || res.statusText));
        return;
      }
      const newUser = await res.json();
      await fetchUsers();
      await fetchRoles();
      setForm({ name: "", email: "", phone: "", password: "", roles: [] });
      setShowModal(false);
    } catch (error) {
      alert("An error occurred: " + error.message);
    }
  };

  const handleEditUser = (user) => {
    console.log("Editing user:", user);
    setEditingUser({
      _id: user._id,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      roles: Array.isArray(user.roles)
        ? user.roles.map((role) => role._id || role).filter(Boolean)
        : [],
    });
    console.log("Set editing user to:", {
      _id: user._id,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      roles: Array.isArray(user.roles)
        ? user.roles.map((role) => role._id || role).filter(Boolean)
        : [],
    });
  };

  const handleSaveEdit = async () => {
    try {
      if (!editingUser.name || editingUser.name.trim().length < 2) {
        alert("Name must be at least 2 characters long");
        return;
      }

      if (!editingUser.email || editingUser.email.trim() === "") {
        alert("Email is required");
        return;
      }

      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(editingUser.email)) {
        alert("Please enter a valid email address");
        return;
      }

      // Prepare the data to send
      const updateData = {
        userId: editingUser._id,
        name: editingUser.name.trim(),
        email: editingUser.email.trim(),
        phone: editingUser.phone ? editingUser.phone.trim() : "",
        roles: Array.isArray(editingUser.roles) ? editingUser.roles : [],
      };

      console.log("Sending update data:", updateData);

      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const responseData = await res.json();
      console.log("Update response:", responseData);

      if (!res.ok) {
        alert(
          "Failed to update user: " + (responseData.error || res.statusText)
        );
        return;
      }

      await fetchUsers();
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("An error occurred: " + error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const res = await fetch(`/api/users?userId=${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert("Failed to delete user: " + (errorData.error || res.statusText));
        return;
      }

      await fetchUsers();
    } catch (error) {
      alert("An error occurred: " + error.message);
    }
  };

  const isEditing = (userId) => editingUser && editingUser._id === userId;

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
        <h2 className="text-xl font-bold">Users</h2>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 rounded bg-blue-500 text-black hover:bg-blue-600 cursor-pointer"
        >
          + Add User
        </button>
      </div>

      <table className="min-w-full bg-gray-700 border border-black">
        <thead className="bg-blue-700">
          <tr>
            <th className="py-2 px-4 border">ID</th>
            <th className="py-2 px-4 border">Name</th>
            <th className="py-2 px-4 border">Email</th>
            <th className="py-2 px-4 border">Phone</th>
            <th className="py-2 px-4 border">Roles</th>
            <th className="py-2 px-4 border">Permissions</th>
            <th className="py-2 px-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-4">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user, index) => (
              <tr key={user._id}>
                <td className="py-2 px-4 border">{index + 1}</td>
                <td className="py-2 px-4 border">
                  {isEditing(user._id) ? (
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, name: e.target.value })
                      }
                      className="w-full p-1 text-black rounded"
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td className="py-2 px-4 border">
                  {isEditing(user._id) ? (
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          email: e.target.value,
                        })
                      }
                      className="w-full p-1 text-black rounded"
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td className="py-2 px-4 border">
                  {isEditing(user._id) ? (
                    <input
                      type="text"
                      value={editingUser.phone}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          phone: e.target.value,
                        })
                      }
                      className="w-full p-1 text-black rounded"
                    />
                  ) : (
                    user.phone
                  )}
                </td>
                <td className="py-2 px-4 border">
                  {isEditing(user._id) ? (
                    <div className="flex flex-wrap gap-1">
                      {roles.map((role) => (
                        <label
                          key={role._id}
                          className="flex items-center gap-1 text-white text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={editingUser.roles.includes(role._id)}
                            onChange={(e) => {
                              let updatedRoles;
                              if (e.target.checked) {
                                updatedRoles = [...editingUser.roles, role._id];
                              } else {
                                updatedRoles = editingUser.roles.filter(
                                  (r) => r !== role._id
                                );
                              }
                              setEditingUser({
                                ...editingUser,
                                roles: updatedRoles,
                              });
                            }}
                          />
                          {role.label}
                        </label>
                      ))}
                    </div>
                  ) : Array.isArray(user.roles) && user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <span
                        key={role._id || role}
                        className="bg-gray-200 text-black px-2 py-1 rounded text-xs mr-1"
                      >
                        {role.label || role.value || role}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">No roles</span>
                  )}
                </td>
                <td className="py-2 px-4 border">
                  {Array.isArray(user.permissions) &&
                  user.permissions.length > 0
                    ? user.permissions.join(", ")
                    : "-"}
                </td>
                <td className="py-2 px-4 border">
                  {isSuperadmin ? (
                    isEditing(user._id) ? (
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
                          onClick={() => handleEditUser(user)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    )
                  ) : (
                    <span className="text-gray-400">No permissions</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-blue-500 p-8 rounded w-96 shadow-lg flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-6 text-white">
              Add New User
            </h3>
            {showAccessDenied ? (
              <AccessDenied />
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mb-3 border p-2 rounded text-black"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full mb-3 border p-2 rounded text-black"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full mb-3 border p-2 rounded text-black"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full mb-3 border p-2 rounded text-black"
                />
                <div className="w-full mb-3">
                  <label className="block mb-1 font-medium text-white">
                    Roles
                  </label>
                  <div className="flex flex-row gap-6 mb-2">
                    {roles.length === 0 ? (
                      <span className="text-gray-200">No roles available</span>
                    ) : (
                      roles.map((role) => (
                        <label
                          key={role.value}
                          className="flex items-center gap-1 text-white"
                        >
                          <input
                            type="checkbox"
                            value={role.value}
                            checked={form.roles.includes(role.value)}
                            onChange={async (e) => {
                              let updatedRoles;
                              if (e.target.checked) {
                                updatedRoles = [...form.roles, role.value];
                              } else {
                                updatedRoles = form.roles.filter(
                                  (r) => r !== role.value
                                );
                              }
                              setForm({ ...form, roles: updatedRoles });
                              // Fetch permissions for the selected roles
                              const permsSet = new Set();
                              for (const r of updatedRoles) {
                                const res = await fetch(`/api/roles?role=${r}`);
                                if (res.ok) {
                                  const perms = await res.json();
                                  perms.forEach((p) => permsSet.add(p));
                                }
                              }
                              setRolePermissions(Array.from(permsSet));
                            }}
                          />
                          {role.label}
                        </label>
                      ))
                    )}
                  </div>
                  <div className="w-full mt-2">
                    <span className="block text-sm text-white mb-1">
                      Permissions for selected role(s):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {rolePermissions.length > 0 ? (
                        rolePermissions.map((perm) => (
                          <span
                            key={perm}
                            className="bg-white text-blue-700 px-2 py-1 rounded text-xs border border-blue-700"
                          >
                            {perm}
                          </span>
                        ))
                      ) : (
                        <span className="text-yellow-200">No permissions</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-6 w-full">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setShowAccessDenied(false);
                      fetchRoles();
                    }}
                    className="px-6 py-2 border-2 border-blue-700 rounded bg-white text-blue-700 font-bold hover:bg-blue-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddUser}
                    className="px-6 py-2 rounded bg-green-500 text-white font-bold hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => router.push("/user-dashboard")}
                    className="px-6 py-2 rounded bg-gray-500 text-white font-bold hover:bg-gray-600"
                  >
                    Back to First Page
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
