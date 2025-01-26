/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
//@ts-nocheck
"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import Link from "next/link";
import SymbolForm from "./SymbolForm";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 10;

export default function Symbols() {
  const [symbols, setSymbols] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  useEffect(() => {
    fetchSymbols(1);
  }, []);

  const deleteSymbol = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/symbols/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSymbols(symbols.filter((symbol) => symbol.id !== id));
        toast({
          title: "Symbol deleted",
          description: "The symbol has been successfully deleted.",
        });
        fetchSymbols(currentPage);
      } else {
        throw new Error("Failed to delete symbol");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the symbol. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchSymbols = async (page: number) => {
    try {
      const response = await fetch(
        `/api/admin/symbols?page=${page}&limit=${ITEMS_PER_PAGE}`
      );
      const data = await response.json();
      setSymbols(data.symbols);
      setTotalCount(data.totalCount);
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch symbols. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Symbols</h1>
      <SymbolForm onSuccess={() => fetchSymbols(currentPage)} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Current Price</TableHead>
            <TableHead>Payout</TableHead>
            <TableHead>Enabled</TableHead>
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
              <TableCell>
                <Button asChild className="mr-2">
                  <Link href={`/admin/symbols/${symbol.id}`}>Edit</Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the symbol and remove it from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteSymbol(symbol.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => fetchSymbols(currentPage - 1)}
              disabled={currentPage === 1}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => fetchSymbols(page)}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => fetchSymbols(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
