"use client";

import Link from "next/link";

export function Sidebar() {
  const links = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/symbols", label: "Symbols" },
    { href: "/admin/transactions", label: "Transactions" },
    { href: "/admin/orders", label: "Orders" },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col p-4">
      <h1 className="text-xl font-bold mb-6">Admin Panel</h1>
      <nav className="flex flex-col space-y-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium hover:text-gray-300"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
