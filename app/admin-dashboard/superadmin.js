import AccessDenied from "../components/AccessDenied";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SuperadminPanel() {
  const [isSuperadmin, setIsSuperadmin] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const roles = user?.roles || [];
        if (
          roles.some(
            (role) => role.value === "superadmin" || role === "superadmin"
          )
        ) {
          setIsSuperadmin(true);
          return;
        }
      } catch {}
    }
    setIsSuperadmin(false);
  }, []);

  if (isSuperadmin === null) return null;
  if (!isSuperadmin) return <AccessDenied />;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-3xl font-bold mb-6">Superadmin Panel</h1>
      <ul className="space-y-4">
        <li>
          <Link href="/permissions" className="text-blue-600 underline">
            Manage Permissions
          </Link>
        </li>
        <li>
          <Link href="/roles" className="text-blue-600 underline">
            Manage Roles
          </Link>
        </li>
        <li>
          <Link href="/users" className="text-blue-600 underline">
            Manage Users
          </Link>
        </li>
      </ul>
    </div>
  );
}
