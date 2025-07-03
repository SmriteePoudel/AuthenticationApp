"use client";
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSave } from "react-icons/fa";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/app/components/ConfirmModal";

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(null);
  const [confirmIdx, setConfirmIdx] = useState(null);
  const router = useRouter();

  const DEFAULT_PERMISSIONS = [
    "user.create",
    "user.read",
    "user.update",
    "user.delete",
  ];

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    const res = await fetch("/api/permissions");
    let data = await res.json();
    if (!Array.isArray(data)) {
      data = [];
    }
    setPermissions(data);
  };

  const handleEdit = (idx) => {
    setConfirmType("edit");
    setConfirmIdx(idx);
    setConfirmOpen(true);
  };

  const handleEditChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleEditSave = async (idx) => {
    const updatedName = editValue;
    await fetch("/api/permissions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index: idx, name: updatedName }),
    });
    await fetchPermissions();
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

  const handleDeleteClick = (idx) => {
    setConfirmType("delete");
    setConfirmIdx(idx);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (confirmType === "edit") {
      setEditIndex(confirmIdx);
      setEditValue(permissions[confirmIdx]);
    } else if (confirmType === "delete") {
      await handleDelete(confirmIdx);
    }
    setConfirmOpen(false);
    setConfirmType(null);
    setConfirmIdx(null);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setConfirmType(null);
    setConfirmIdx(null);
  };

  const handleDelete = async (idx) => {
    await fetch("/api/permissions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index: idx }),
    });
    await fetchPermissions();
  };

  const handleAddPermission = async (name) => {
    await fetch("/api/permissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await fetchPermissions();
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Permissions</h1>
      <p className="text-m font-sans mb-6">Here is a list of permissions</p>
      <button
        className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => router.push("/permissions/add")}
      >
        + Add New Permission
      </button>
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
            <tr
              key={perm.value || perm.label || perm || idx}
              className="hover:bg-gray-800"
            >
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
                  perm.label || perm.value || perm
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
                    onClick={() => handleDeleteClick(idx)}
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
          confirmType === "edit"
            ? "Are you sure you want to edit this permission?"
            : "Are you sure you want to delete this permission?"
        }
      />
    </div>
  );
}
