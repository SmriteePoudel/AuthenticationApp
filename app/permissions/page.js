"use client";
import React, { useState, useEffect } from "react";
import { roles } from "@/app/lib/roles";

export default function PermissionsPage() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Role Permissions</h2>
      <table className="min-w-full bg-gray-700 border border-black">
        <thead className="bg-blue-700">
          <tr>
            <th className="py-2 px-4 border">Role</th>
            <th className="py-2 px-4 border">View</th>
            <th className="py-2 px-4 border">Add</th>
            <th className="py-2 px-4 border">Edit</th>
            <th className="py-2 px-4 border">Delete</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.value}>
              <td className="py-2 px-4 border font-semibold">{role.label}</td>
              {["view", "add", "edit", "delete"].map((perm) => (
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
