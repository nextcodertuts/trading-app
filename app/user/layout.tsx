// app/user/layout.tsx
import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth";
import SessionProvider from "./SessionProvider";
import { TradingProvider } from "@/lib/trading-context";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, session } = await validateRequest();

  if (!user || !session) {
    redirect("/auth/login");
  }

  return (
    <SessionProvider value={{ user, session }}>
      <TradingProvider>
        <div>{children}</div>
      </TradingProvider>
    </SessionProvider>
  );
}
