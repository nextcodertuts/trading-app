/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
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
import ClientSymbolForm from "./ClientSymbolForm";
import DeleteSymbolButton from "./DeleteSymbolButton";
import { PaginationWrapper } from "./PaginationWrapper";

const ITEMS_PER_PAGE = 10;

export default async function Symbols({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(Array.isArray(page) ? page[0] : page) || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const [symbols, totalCount] = await Promise.all([
    prisma.symbol.findMany({
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: { name: "asc" },
    }),
    prisma.symbol.count(),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Symbols</h1>
      <Suspense fallback={<div>Loading form...</div>}>
        <ClientSymbolForm />
      </Suspense>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Current Price</TableHead>
            <TableHead>Payout</TableHead>
            <TableHead>Enabled</TableHead>
            <TableHead>Trend</TableHead>
            <TableHead>Volatility</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {symbols.map((symbol) => (
            <TableRow key={symbol.id}>
              <TableCell>{symbol.name}</TableCell>
              <TableCell>${symbol.currentPrice.toFixed(2)}</TableCell>
              <TableCell>{symbol.payout}%</TableCell>
              <TableCell>{symbol.enabled ? "Yes" : "No"}</TableCell>
              <TableCell>{symbol.trend || "N/A"}</TableCell>
              <TableCell>{symbol.volatility.toFixed(2)}</TableCell>
              <TableCell>{symbol.status}</TableCell>
              <TableCell>
                <Button asChild className="mr-2">
                  <Link href={`/admin/symbols/${symbol.id}`}>Edit</Link>
                </Button>
                <DeleteSymbolButton id={symbol.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PaginationWrapper currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
