"use client";
import React, { useState } from "react";
import { roles as initialRoles } from "@/app/lib/roles";

const PERMISSIONS = ["create", "read", "update", "delete"];

export default function RolesPage() {
  const [roles, setRoles] = useState(initialRoles);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    permissions: [],
  });

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

  const handleCancel = () => {
    setForm({ name: "", permissions: [] });
    setShowModal(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Roles</h2>
        <button
          className="bg-blue-600 text-black px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          Add New Role
        </button>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg text-black">
            <h3 className="text-lg font-semibold mb-4">Add New Role</h3>
            <input
              className="w-full border px-3 py-2 rounded mb-4 text-black placeholder-black"
              placeholder="Role name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div className="mb-4">
              <div className="font-medium mb-2">Permissions:</div>
              <div className="flex gap-4">
                {PERMISSIONS.map((perm) => (
                  <label
                    key={perm}
                    className="flex items-center gap-1 text-black"
                  >
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(perm)}
                      onChange={() => handleCheckbox(perm)}
                    />
                    {perm.charAt(0).toUpperCase() + perm.slice(1)}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-400 text-black"
                onClick={handleCancel}
              >
                Cancel
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
            {PERMISSIONS.map((perm) => (
              <th key={perm} className="py-2 px-4 border">
                {perm.charAt(0).toUpperCase() + perm.slice(1)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.value}>
              <td className="py-2 px-4 border font-semibold">{role.label}</td>
              {PERMISSIONS.map((perm) => (
                <td className="py-2 px-4 border text-center" key={perm}>
                  <input
                    type="checkbox"
                    checked={role.permissions.includes(perm)}
                    readOnly
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
