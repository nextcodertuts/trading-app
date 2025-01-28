/* eslint-disable @typescript-eslint/no-empty-object-type */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Users,
  Coins,
  Receipt,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { logout } from "@/app/auth/actions";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/symbols", label: "Symbols", icon: Coins },
    { href: "/admin/transactions", label: "Transactions", icon: Receipt },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  ];

  return (
    <div
      className={cn(
        "relative flex flex-col h-screen border-r",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && <h1 className="text-xl font-bold">Admin Panel</h1>}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-4 z-20"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      <ScrollArea className="flex-1 mt-4">
        <nav className="flex flex-col p-2 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center px-2 py-2 rounded-lg transition-colors",
                pathname === link.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <link.icon
                className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-2")}
              />
              {!isCollapsed && (
                <span className="text-sm font-medium">{link.label}</span>
              )}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="p-2 text-red-500 border-t">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start",
            isCollapsed && "justify-center"
          )}
          onClick={() => {
            logout();
          }}
        >
          <LogOut className={cn("h-5 w-4", isCollapsed ? "mx-auto" : "mr-2")} />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}
