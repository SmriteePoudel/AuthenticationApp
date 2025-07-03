"use client";
import React from "react";

export default function ConfirmModal({ open, onConfirm, onCancel, message }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-xs flex flex-col items-center">
        <p className="mb-6 text-center text-black">{message}</p>
        <div className="flex gap-4">
          <button
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            onClick={onConfirm}
          >
            Yes
          </button>
          <button
            className="bg-gray-400 text-black px-4 py-2 rounded hover:bg-gray-600"
            onClick={onCancel}
          >
            No
          </button>
          <button
            className="bg-gray-400 text-black px-4 py-2 rounded hover:bg-gray-600"
            onClick={onCancel}
          >
            I dont care
          </button>
        </div>
      </div>
    </div>
  );
}
