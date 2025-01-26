"use client";

import { type ReactNode, useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />
      <main
        className={`flex-1 p-2 transition-all ${isCollapsed ? "ml-4" : "ml-4"}`}
      >
        {children}
      </main>
    </div>
  );
}
