"use client";
import React, { useState } from "react";
import { FaEdit, FaTrash, FaSave } from "react-icons/fa";

const INITIAL_PERMISSIONS = [
  "user.create",
  "user.read",
  "user.update",
  "user.delete",
];

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState(INITIAL_PERMISSIONS);
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleEdit = (idx) => {
    setEditIndex(idx);
    setEditValue(permissions[idx]);
  };

  const handleEditChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleEditSave = (idx) => {
    const updated = [...permissions];
    updated[idx] = editValue;
    setPermissions(updated);
    setEditIndex(null);
    setEditValue("");
  };

  const handleEditKeyDown = (e, idx) => {
    if (e.key === "Enter") {
      handleEditSave(idx);
    } else if (e.key === "Escape") {
      setEditIndex(null);
      setEditValue("");
    }
  };

  const handleDelete = (idx) => {
    setPermissions(permissions.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Permissions</h1>
      <p className="text-m font-sans mb-6">Here is a list of permissions</p>
      <table className="min-w-full table-fixed bg-black border border-gray-700 rounded">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-700 text-left text-white">
              Permission
            </th>
            <th className="py-2 px-4 border-b border-gray-700 text-left text-white">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((perm, idx) => (
            <tr key={perm} className="hover:bg-gray-800">
              <td className="py-2 px-4 border-b border-gray-700 text-white">
                {editIndex === idx ? (
                  <input
                    className="bg-gray-900 text-white border border-gray-600 rounded px-2 py-1 w-full"
                    value={editValue}
                    onChange={handleEditChange}
                    onBlur={() => handleEditSave(idx)}
                    onKeyDown={(e) => handleEditKeyDown(e, idx)}
                    autoFocus
                  />
                ) : (
                  perm
                )}
              </td>
              <td className="py-2 px-4 border-b border-gray-700">
                <div className="flex flex-row gap-4 items-center">
                  {editIndex === idx ? (
                    <button
                      title="Save"
                      className="text-green-500 hover:text-green-700"
                      onClick={() => handleEditSave(idx)}
                    >
                      <FaSave />
                    </button>
                  ) : (
                    <button
                      title="Edit"
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => handleEdit(idx)}
                    >
                      <FaEdit />
                    </button>
                  )}
                  <button
                    title="Delete"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(idx)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
