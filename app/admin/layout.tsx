import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { validateRequest } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, session } = await validateRequest();

  if (!user || !session) {
    redirect("/auth/login");
  }

  // Check if the user has the ADMIN role
  if (user.role !== "ADMIN") {
    console.log(user.role);

    // If the user is not an admin, redirect them to a forbidden page or the home page
    redirect("/auth/login"); // You might want to create this page or redirect to an existing error page
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 p-2 transition-all ml-4">{children}</main>
    </div>
  );
}
