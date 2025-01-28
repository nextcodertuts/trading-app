// components/user-dashboard/Balance.tsx
"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function Balance() {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch("/api/balance");
        if (!response.ok) {
          throw new Error("Failed to fetch balance");
        }
        const data = await response.json();
        setBalance(data.balance);
      } catch (error) {
        console.error("Error fetching balance:", error);
        toast({
          title: "Error",
          description: "Failed to fetch balance. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
    // Set up an interval to fetch the balance every 60 seconds
    const intervalId = setInterval(fetchBalance, 60000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [toast]);

  return (
    <div className="text-center px-4 shadow-sm">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading balance...</p>
      ) : balance !== null ? (
        <p className="text-lg font-semibold">Balance: ${balance.toFixed(2)}</p>
      ) : (
        <p className="text-sm text-red-500">Failed to load balance</p>
      )}
    </div>
  );
}
