"use client";

import { useState, useEffect } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";

const TradingViewWidget = dynamic(
  () => import("@/components/TradingViewWidget"),
  { ssr: false }
);

export default function DashboardPage() {
  const [balance, setBalance] = useState(0);
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradeDirection, setTradeDirection] = useState<"up" | "down" | null>(
    null
  );

  useEffect(() => {
    // Fetch user balance
    const fetchBalance = async () => {
      const response = await fetch("/api/balance");
      const data = await response.json();
      setBalance(data.balance);
    };
    fetchBalance();
  }, []);

  const handleTrade = async () => {
    if (!tradeAmount || !tradeDirection) return;

    const response = await fetch("/api/trade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number.parseFloat(tradeAmount),
        direction: tradeDirection,
      }),
    });

    if (response.ok) {
      // Handle successful trade
      const data = await response.json();
      setBalance(data.newBalance);
      // Reset trade inputs
      setTradeAmount("");
      setTradeDirection(null);
    } else {
      // Handle error
      console.error("Trade failed");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Market Chart</CardTitle>
          <CardDescription>Live price updates</CardDescription>
        </CardHeader>
        <CardContent>
          <TradingViewWidget />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Trading Interface</CardTitle>
          <CardDescription>Place your trades here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p>Current Balance: ${balance.toFixed(2)}</p>
          </div>
          <div className="space-y-4">
            <Input
              type="number"
              placeholder="Trade Amount"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
            />
            <div className="flex space-x-2">
              <Button
                onClick={() => setTradeDirection("up")}
                variant={tradeDirection === "up" ? "default" : "outline"}
              >
                Up
              </Button>
              <Button
                onClick={() => setTradeDirection("down")}
                variant={tradeDirection === "down" ? "default" : "outline"}
              >
                Down
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleTrade}
            disabled={!tradeAmount || !tradeDirection}
          >
            Place Trade
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
