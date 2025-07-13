"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const roles = user?.roles || [];
        if (roles.some((role) => role.value === "admin")) setRole("admin");
        else if (roles.length > 0) setRole("user");
        else setRole(null);
      } catch {
        setRole(null);
      }
    }
  }, []);

  function handleLogout(e) {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    router.push("/login");
  }

  let navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  if (role === "admin") {
    navItems.push({ label: "Admin Dashboard", href: "/admin-dashboard" });
    navItems.push({ label: "Logout", href: "/login" });
  } else if (role === "user") {
    navItems.push({ label: "User Dashboard", href: "/user-dashboard" });
    navItems.push({ label: "Logout", href: "/login" });
  } else {
    navItems.push({ label: "Login", href: "/login" });
    navItems.push({ label: "Register", href: "/register" });
  }

  return (
    <nav className="w-full bg-gray-900 text-white px-6 py-3 flex items-center justify-between shadow">
      <div className="text-xl font-bold">My Auth App</div>
      <div className="flex gap-6">
        {navItems.map((item) =>
          item.label === "Logout" ? (
            <button
              key="logout"
              onClick={handleLogout}
              className="hover:underline bg-transparent border-none cursor-pointer"
            >
              {item.label}
            </button>
          ) : (
            <Link key={item.href} href={item.href} className="hover:underline">
              {item.label}
            </Link>
          )
        )}
      </div>
    </nav>
  );
}
