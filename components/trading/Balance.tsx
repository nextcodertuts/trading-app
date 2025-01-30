"use client";

import { useQuery } from "@tanstack/react-query";

export function Balance() {
  const { data: balanceData } = useQuery({
    queryKey: ["balance"],
    queryFn: async () => {
      const response = await fetch("/api/balance");
      if (!response.ok) throw new Error("Failed to fetch balance");
      return response.json();
    },
    refetchInterval: 5000,
  });

  return (
    <div className="text-sm">
      <span className="text-muted-foreground">Balance:</span>{" "}
      <span className="font-bold">
        ${balanceData?.balance?.toFixed(2) || "0.00"}
      </span>
    </div>
  );
}
