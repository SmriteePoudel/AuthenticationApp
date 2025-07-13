"use client";
import AccessDenied from "../../components/AccessDenied";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SuperadminPanel() {
  const [isSuperadmin, setIsSuperadmin] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
          router.push("/login");
          return;
        }

        console.log("DEBUG: Superadmin page - User data:", user);
        const roles = user?.roles || [];
        console.log("DEBUG: Superadmin page - Roles:", roles);
        console.log("DEBUG: Superadmin page - User email:", user.email);

        const isSuperadminByRole = roles.some(
          (role) => role.value === "superadmin" || role === "superadmin"
        );
        console.log(
          "DEBUG: Superadmin page - isSuperadminByRole:",
          isSuperadminByRole
        );

        // Check by email as fallback
        const isSuperadminByEmail = user.email === "superadmin@example.com";
        console.log(
          "DEBUG: Superadmin page - isSuperadminByEmail:",
          isSuperadminByEmail
        );

        // Grant access if either check passes
        if (isSuperadminByRole || isSuperadminByEmail) {
          console.log("DEBUG: Superadmin page - Access granted");
          setIsSuperadmin(true);
          return;
        }

        // Temporary bypass for testing - always grant access to superadmin@example.com
        if (user.email === "superadmin@example.com") {
          console.log("DEBUG: Superadmin page - Temporary bypass granted");
          setIsSuperadmin(true);
          return;
        }

        console.log("DEBUG: Superadmin page - Access denied");
      } catch (error) {
        console.error("Error checking superadmin access:", error);
      }
    }
    setIsSuperadmin(false);
  }, [router]);

  if (isSuperadmin === null) return <div>Loading...</div>;
  if (!isSuperadmin) return <AccessDenied />;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Superadmin Panel
          </h1>
          <p className="text-gray-700 mb-8">
            Welcome to the Superadmin Dashboard. You have full access to all
            system features.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-xl font-semibold mb-3 text-blue-800">
                User Management
              </h3>
              <p className="text-blue-600 mb-4">
                Manage all users in the system
              </p>
              <Link
                href="/users"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Manage Users
              </Link>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-xl font-semibold mb-3 text-green-800">
                Role Management
              </h3>
              <p className="text-green-600 mb-4">
                Create and manage user roles
              </p>
              <Link
                href="/roles"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                Manage Roles
              </Link>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h3 className="text-xl font-semibold mb-3 text-purple-800">
                Permission Management
              </h3>
              <p className="text-purple-600 mb-4">
                Configure system permissions
              </p>
              <Link
                href="/permissions"
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
              >
                Manage Permissions
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/admin-dashboard"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ← Back to Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
