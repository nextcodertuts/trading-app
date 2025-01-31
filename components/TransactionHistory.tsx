/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function TransactionHistory() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState({
    deposits: [],
    withdrawals: [],
  });
  const [selectedTab, setSelectedTab] = useState("deposits");

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/wallet-transaction");
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch transaction history.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="deposits">Deposit History</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawal History</TabsTrigger>
          </TabsList>

          {/* Deposit History */}
          <TabsContent value="deposits">
            <TransactionTable
              transactions={transactions.deposits}
              type="deposit"
            />
          </TabsContent>

          {/* Withdrawal History */}
          <TabsContent value="withdrawals">
            <TransactionTable
              transactions={transactions.withdrawals}
              type="withdrawal"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Transaction Table Component
function TransactionTable({
  transactions,
  type,
}: {
  transactions: any[];
  type: string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.length > 0 ? (
          transactions.map((transaction, index) => (
            <TableRow key={index}>
              <TableCell>
                {new Date(transaction.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>₹{transaction.amount.toFixed(2)}</TableCell>
              <TableCell>{transaction.status}</TableCell>
              <TableCell>{transaction.details || "-"}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              No {type} transactions found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
