"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AccessDenied from "../components/AccessDenied";

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    roles: [],
  });
  const [rolePermissions, setRolePermissions] = useState([]);

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
      // Map selected role values to their ObjectIds
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

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Users</h2>
        <button
          onClick={handleOpenModal}
          className="bg-blue-500 text-black px-4 py-2 rounded"
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
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-4">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user, index) => (
              <tr key={user._id}>
                <td className="py-2 px-4 border">{index + 1}</td>
                <td className="py-2 px-4 border">{user.name}</td>
                <td className="py-2 px-4 border">{user.email}</td>
                <td className="py-2 px-4 border">{user.phone}</td>
                <td className="py-2 px-4 border">
                  {Array.isArray(user.roles) && user.roles.length > 0 ? (
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
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
