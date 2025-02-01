import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const { user } = await validateRequest();
  if (!user) {
    redirect("/auth/login");
  } else if (user?.role === "ADMIN") {
    redirect("/admin");
  } else if (user) {
    redirect("/trading/BTCUSDT");
  }
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h2>Home Ui</h2>
    </div>
  );
}
