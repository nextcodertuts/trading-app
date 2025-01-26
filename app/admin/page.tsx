import prisma from "@/lib/prisma";

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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-100 rounded-lg shadow">
          <h2 className="text-lg font-bold">Total Users</h2>
          <p className="text-2xl">{usersCount}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded-lg shadow">
          <h2 className="text-lg font-bold">Active Trades</h2>
          <p className="text-2xl">{activeOrders}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded-lg shadow">
          <h2 className="text-lg font-bold">Total Deposits</h2>
          <p className="text-2xl">
            ${totalDeposits._sum.amount?.toFixed(2) || "0.00"}
          </p>
        </div>
        <div className="p-4 bg-gray-100 rounded-lg shadow">
          <h2 className="text-lg font-bold">Total Withdrawals</h2>
          <p className="text-2xl">
            ${totalWithdrawals._sum.amount?.toFixed(2) || "0.00"}
          </p>
        </div>
      </div>
    </div>
  );
}
