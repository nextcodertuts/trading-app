import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function page() {
  const { user } = await validateRequest();

  if (user?.role === "ADMIN") {
    redirect("/admin");
  } else if (user) {
    redirect("/trading/1");
  }
  return <div>User Page</div>;
}
