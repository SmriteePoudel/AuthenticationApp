"use client";
import AccessDenied from "../components/AccessDenied";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 border rounded shadow">
      <button
        className="mb-4 px-4 py-2 rounded bg-gray-500 text-white font-bold hover:bg-gray-600"
        onClick={() => router.push("/user-dashboard")}
      >
        Back to Dashboard
      </button>
      <h1 className="text-2xl font-bold mb-4">About</h1>
      <p className="text-gray-700">This is the About page of My Auth App.</p>
    </div>
  );
}
