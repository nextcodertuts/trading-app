import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();

  if (user?.role === "ADMIN") {
    redirect("/admin");
  } else if (user) {
    redirect("/user");
  }

  return <>{children}</>;
}
