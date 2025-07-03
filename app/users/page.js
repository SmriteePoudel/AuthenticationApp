"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AccessDenied from "../components/AccessDenied";
import { roles as allRoles } from "../lib/roles";

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    roles: [],
  });

  const currentUserRoles = ["admin"];

  const currentPermissions = Array.from(
    new Set(
      currentUserRoles.flatMap((role) => {
        const found = allRoles.find((r) => r.value === role);
        return found ? found.permissions : [];
      })
    )
  );
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
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
    if (!currentPermissions.includes("create")) {
      setShowAccessDenied(true);
      return;
    }
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, roles: form.roles }),
      });

      if (!res.ok) {
        alert("Failed to create user: " + res.statusText);
        return;
      }

      const newUser = await res.json();
      await fetchUsers();
      await fetchRoles();
      setForm({ name: "", email: "", phone: "", roles: [] });
      setShowModal(false);
    } catch (error) {
      alert("An error occurred: " + error.message);
    }
  };

  if (!currentPermissions.includes("read")) {
    return <AccessDenied />;
  }

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
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user, index) => (
              <tr key={user.id}>
                <td className="py-2 px-4 border">{user.id}</td>
                <td className="py-2 px-4 border">{user.name}</td>
                <td className="py-2 px-4 border">{user.email}</td>
                <td className="py-2 px-4 border">{user.phone}</td>
                <td className="py-2 px-4 border">
                  {Array.isArray(user.roles)
                    ? user.roles.join(", ")
                    : user.role || ""}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-blue-500 p-6 rounded w-96 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Add New User</h3>

            {showAccessDenied ? (
              <AccessDenied />
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mb-3 border p-2 rounded"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full mb-3 border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full mb-3 border p-2 rounded"
                />
                <div className="w-full mb-3">
                  <label className="block mb-1 font-medium">Roles</label>
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <label
                        key={role.value}
                        className="flex items-center gap-1"
                      >
                        <input
                          type="checkbox"
                          value={role.value}
                          checked={form.roles.includes(role.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({
                                ...form,
                                roles: [...form.roles, role.value],
                              });
                            } else {
                              setForm({
                                ...form,
                                roles: form.roles.filter(
                                  (r) => r !== role.value
                                ),
                              });
                            }
                          }}
                        />
                        {role.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setShowAccessDenied(false);
                      fetchRoles();
                    }}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddUser}
                    className="bg-green-500 text-black px-4 py-2 rounded"
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
