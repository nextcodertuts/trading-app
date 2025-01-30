/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

async function getUserProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { symbol: true },
      },
      walletTransactions: {
        take: 5,
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export default async function ProfilePage() {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getUserProfile(user.id);

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage
                src={profile.avatarImg || undefined}
                alt={profile.name || ""}
              />
              <AvatarFallback>
                {profile.name?.charAt(0) || profile.email.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{profile.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <Badge
                variant={profile.role === "ADMIN" ? "destructive" : "secondary"}
              >
                {profile.role}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <h3 className="text-lg font-semibold">Account Details</h3>
              <p className="text-sm text-muted-foreground">
                Member since{" "}
                {formatDistanceToNow(new Date(profile.createdAt), {
                  addSuffix: true,
                })}
              </p>
              <p className="text-sm text-muted-foreground">
                Last updated{" "}
                {formatDistanceToNow(new Date(profile.updatedAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Balance</h3>
              <p className="text-2xl font-bold">
                ${profile.balance.toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Recent Orders</h3>
              <ul className="space-y-2">
                {profile.orders.map((order) => (
                  <li key={order.id} className="text-sm">
                    <span className="font-medium">{order.symbol.name}</span> - $
                    {order.amount} ({order.direction}) -
                    <span
                      className={
                        order.outcome === "win"
                          ? "text-green-500"
                          : order.outcome === "loss"
                          ? "text-red-500"
                          : "text-yellow-500"
                      }
                    >
                      {order.outcome || "Pending"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <ul className="space-y-2">
                {profile.walletTransactions.map((transaction) => (
                  <li key={transaction.id} className="text-sm">
                    <span className="font-medium">{transaction.type}</span> - $
                    {transaction.amount} -
                    <span
                      className={
                        transaction.status === "approved"
                          ? "text-green-500"
                          : transaction.status === "rejected"
                          ? "text-red-500"
                          : "text-yellow-500"
                      }
                    >
                      {transaction.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
