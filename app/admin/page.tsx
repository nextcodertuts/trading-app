import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";

async function clearHistoricalData() {
  "use server";

  try {
    await prisma.historicalPrice.deleteMany({});
    revalidatePath("/admin");
  } catch (error) {
    console.error("Error clearing historical data:", error);
    throw new Error("Failed to clear historical data");
  }
}

export default async function Dashboard() {
  const usersCount = await prisma.user.count();
  const activeOrders = await prisma.order.count({
    where: { outcome: null }, // Open trades
  });
  const totalDeposits = await prisma.walletTransaction.aggregate({
    _sum: { amount: true },
    where: { type: "deposit", status: "approved" },
  });
  const totalWithdrawals = await prisma.walletTransaction.aggregate({
    _sum: { amount: true },
    where: { type: "withdrawal", status: "approved" },
  });

  const stats = [
    { title: "Total Users", value: usersCount, icon: Users },
    { title: "Active Trades", value: activeOrders, icon: TrendingUp },
    {
      title: "Total Deposits",
      value: `$${totalDeposits._sum.amount?.toFixed(2) || "0.00"}`,
      icon: DollarSign,
    },
    {
      title: "Total Withdrawals",
      value: `$${totalWithdrawals._sum.amount?.toFixed(2) || "0.00"}`,
      icon: CreditCard,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <form action={clearHistoricalData}>
          <Button
            variant="destructive"
            type="submit"
            className="flex items-center gap-2"
          >
            Clear Historical Data
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
