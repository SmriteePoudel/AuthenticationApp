"use client";
import React, { useState, useEffect } from "react";
import { roles as initialRoles } from "@/app/lib/roles";

export default function RolesPage() {
  const [roles, setRoles] = useState(initialRoles);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", permissions: [] });
  const [allPermissions, setAllPermissions] = useState([]);

  useEffect(() => {
    if (showModal) {
      fetchPermissions();
    }
  }, [showModal]);

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

  const handleSave = () => {
    if (!form.name.trim()) return;
    setRoles([
      ...roles,
      {
        value: form.name.toLowerCase().replace(/\s+/g, "_"),
        label: form.name,
        permissions: form.permissions,
      },
    ]);
    setForm({ name: "", permissions: [] });
    setShowModal(false);
  };

  const handleDelete = () => {
    setForm({ name: "", permissions: [] });
    setShowModal(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold"> title</h2>
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
      <table className="min-w-full bg-gray-700 border border-black mt-4">
        <thead className="bg-blue-700">
          <tr>
            <th className="py-2 px-4 border">Role</th>
            <th className="py-2 px-4 border">Permissions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.value}>
              <td className="py-2 px-4 border font-semibold">{role.label}</td>
              <td className="py-2 px-4 border text-center">
                {role.permissions && role.permissions.length > 0
                  ? role.permissions.join(", ")
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
