"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Trade {
  id: number;
  symbolId: number;
  amount: number;
  direction: string;
  entryPrice: number;
  exitPrice: number | null;
  outcome: string | null;
  expiresAt: string;
  createdAt: string;
  profitLoss: number | null;
}

export function TradeHistory() {
  const [openTrades, setOpenTrades] = useState<Trade[]>([]);
  const [closedTrades, setClosedTrades] = useState<Trade[]>([]);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await fetch("/api/trades");
        const data = await response.json();
        setOpenTrades(data.openTrades);
        setClosedTrades(data.closedTrades);
      } catch (error) {
        console.error("Error fetching trades:", error);
      }
    };

    fetchTrades();
    const interval = setInterval(fetchTrades, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Open Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Entry Price</TableHead>
                <TableHead>Expires At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {openTrades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell>{trade.symbolId}</TableCell>
                  <TableCell>${trade.amount.toFixed(2)}</TableCell>
                  <TableCell>{trade.direction}</TableCell>
                  <TableCell>${trade.entryPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(trade.expiresAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Entry Price</TableHead>
                <TableHead>Exit Price</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Profit/Loss</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {closedTrades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell>{trade.symbolId}</TableCell>
                  <TableCell>${trade.amount.toFixed(2)}</TableCell>
                  <TableCell>{trade.direction}</TableCell>
                  <TableCell>${trade.entryPrice.toFixed(2)}</TableCell>
                  <TableCell>${trade.exitPrice?.toFixed(2) || "-"}</TableCell>
                  <TableCell>{trade.outcome}</TableCell>
                  <TableCell
                    className={
                      trade.profitLoss && trade.profitLoss > 0
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    ${trade.profitLoss?.toFixed(2) || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
