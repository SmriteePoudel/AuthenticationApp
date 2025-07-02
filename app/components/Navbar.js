"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Login", href: "/login" },
    { label: "Register", href: "/register" },
  ];

  return (
    <nav className="bg-gray-100 border-b shadow-md p-4 w-full">
      <div className="w-full flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800"> 💻 MyAuthApp</h1>

        <ul className="flex gap-6">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`text-gray-700 hover:text-black font-medium ${
                  pathname === item.href ? "underline underline-offset-4" : ""
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
