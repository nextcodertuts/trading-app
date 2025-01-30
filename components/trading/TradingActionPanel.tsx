/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useSymbol } from "@/lib/symbol-context";
import { useOrder } from "@/lib/order-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

const timeOptions = [
  { value: "5", label: "5s" },
  { value: "10", label: "10s" },
  { value: "15", label: "15s" },
  { value: "30", label: "30s" },
  { value: "60", label: "1m" },
  { value: "120", label: "2m" },
  { value: "180", label: "3m" },
  { value: "300", label: "5m" },
];

const predefinedAmounts = [10, 50, 100, 500, 1000];

interface OrderRequest {
  symbolId: number;
  amount: number;
  direction: "up" | "down";
  duration: number;
}

export function TradingActionPanel() {
  const { toast } = useToast();
  const { symbolData } = useSymbol();
  const { addOrder } = useOrder();
  const queryClient = useQueryClient();
  const [tradeDetails, setTradeDetails] = useState({
    amount: "10",
    time: "60",
  });

  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: OrderRequest) => {
      const response = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to place order");
      }

      return response.json();
    },
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: ["orders"] });
      const previousOrders = queryClient.getQueryData(["orders"]);

      queryClient.setQueryData(["orders"], (old: any) => ({
        ...old,
        orders: [
          ...(old?.orders || []),
          {
            id: Date.now().toString(),
            ...newOrder,
            status: "pending",
            createdAt: new Date().toISOString(),
          },
        ],
      }));

      addOrder({
        id: Date.now().toString(),
        symbolId: newOrder.symbolId,
        price: symbolData?.manipulatedPrice || 0,
        direction: newOrder.direction,
        timestamp: Math.floor(Date.now() / 1000),
        expirationTime: Math.floor(Date.now() / 1000) + newOrder.duration,
      });

      return { previousOrders };
    },
    onError: (err, newOrder, context) => {
      queryClient.setQueryData(["orders"], context?.previousOrders);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Order placed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTradeDetails({ ...tradeDetails, [name]: value });
  };

  const handleTimeChange = (value: string) => {
    setTradeDetails({ ...tradeDetails, time: value });
  };

  const handlePredefinedAmount = (amount: number) => {
    setTradeDetails({ ...tradeDetails, amount: amount.toString() });
  };

  const placeOrder = (direction: "up" | "down") => {
    if (!symbolData) {
      toast({
        title: "Error",
        description:
          "No symbol selected. Please select a trading symbol first.",
        variant: "destructive",
      });
      return;
    }

    if (!tradeDetails.amount || Number(tradeDetails.amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    placeOrderMutation.mutate({
      symbolId: symbolData.id,
      amount: Number(tradeDetails.amount),
      direction,
      duration: Number(tradeDetails.time),
    });
  };

  return (
    <Card className="">
      <CardContent className="space-y-2 p-2">
        <div className="space-y-2">
          <div className="hidden md:flex space-x-1 items-center">
            <label className="md:text-sm text-xs font-medium mb-1 block">
              Quick Amount
            </label>
            <ScrollArea className="w-96 whitespace-nowrap">
              <div className="flex w-max space-x-1 ">
                {predefinedAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePredefinedAmount(amount)}
                    className="w-full "
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
            <div>
              <label className="md:text-sm text-xs font-medium block">
                Custom Amount
              </label>
              <Input
                name="amount"
                type="number"
                value={tradeDetails.amount}
                onChange={handleInputChange}
                placeholder="Enter trade amount"
                className="w-full"
              />
            </div>

            <div>
              <label className="md:text-sm text-xs font-medium block">
                Expiry Time
              </label>
              <Select
                onValueChange={handleTimeChange}
                value={tradeDetails.time}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-1 gap-4 mt-6">
            <Button
              onClick={() => placeOrder("up")}
              className="py-4 sm:py-6 text-base  font-semibold bg-green-500 hover:bg-green-600 text-white"
              disabled={!symbolData || placeOrderMutation.isPending}
            >
              <ArrowUp className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Up
            </Button>
            <Button
              onClick={() => placeOrder("down")}
              className="py-4 sm:py-6 text-base  font-semibold bg-red-500 hover:bg-red-600 text-white"
              disabled={!symbolData || placeOrderMutation.isPending}
            >
              <ArrowDown className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Down
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
