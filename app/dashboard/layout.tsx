import { redirect } from "next/navigation";

import SessionProvider from "./SessionProvider";
import { validateRequest } from "@/lib/auth";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  if (!session.user) redirect("/auth/login");

  return (
    <SessionProvider value={session}>
      <div>{children}</div>
    </SessionProvider>
  );
}
