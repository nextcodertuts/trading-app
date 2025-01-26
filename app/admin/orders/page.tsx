import { Suspense } from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { OrderFilters } from "./OrderFilters";
import { PaginationWrapper } from "../symbols/PaginationWrapper";

const ITEMS_PER_PAGE = 10;

export default async function Orders({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const userId = resolvedParams.userId as string | undefined;
  const symbolId = resolvedParams.symbolId
    ? Number(resolvedParams.symbolId)
    : undefined;
  const direction = resolvedParams.direction as "up" | "down" | undefined;
  const outcome = resolvedParams.outcome as "win" | "loss" | undefined;

  const where = {
    ...(userId && { userId }),
    ...(symbolId && { symbolId }),
    ...(direction && { direction }),
    ...(outcome && { outcome }),
  };

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
        symbol: {
          select: { name: true },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <Suspense fallback={<div>Loading filters...</div>}>
        <OrderFilters />
      </Suspense>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>Entry Price</TableHead>
            <TableHead>Exit Price</TableHead>
            <TableHead>Outcome</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.user.name || order.user.email}</TableCell>
              <TableCell>{order.symbol.name}</TableCell>
              <TableCell>${order.amount.toFixed(2)}</TableCell>
              <TableCell>{order.direction}</TableCell>
              <TableCell>${order.entryPrice.toFixed(2)}</TableCell>
              <TableCell>${order.exitPrice?.toFixed(2) || "N/A"}</TableCell>
              <TableCell>{order.outcome || "Pending"}</TableCell>
              <TableCell>
                {new Date(order.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>
                <Button asChild className="mr-2">
                  <Link href={`/admin/orders/${order.id}`}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PaginationWrapper currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
