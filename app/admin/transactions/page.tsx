import { Suspense } from "react";
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
import { PaginationWrapper } from "../symbols/PaginationWrapper";
import TransactionFilters from "./TransactionFilters";

const ITEMS_PER_PAGE = 10;

export default async function Transactions({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  const type = resolvedParams.type as string | undefined;
  const status = resolvedParams.status as string | undefined;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const where = {
    ...(type && { type }),
    ...(status && { status }),
  };

  const [transactions, totalCount] = await Promise.all([
    prisma.walletTransaction.findMany({
      where,
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.walletTransaction.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>
      <Suspense fallback={<div>Loading filters...</div>}>
        <TransactionFilters />
      </Suspense>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                {transaction.user.name || transaction.user.email}
              </TableCell>
              <TableCell>{transaction.type}</TableCell>
              <TableCell>${transaction.amount.toFixed(2)}</TableCell>
              <TableCell>{transaction.status}</TableCell>
              <TableCell>
                {new Date(transaction.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  View
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
