"use client";

import { useEffect, useState } from "react";

export function LivePriceDisplay() {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchLivePrice = async () => {
      try {
        const response = await fetch("/api/prices");
        const data = await response.json();
        setPrice(data.price);
      } catch (error) {
        console.error("Error fetching live price:", error);
      }
    };

    const interval = setInterval(fetchLivePrice, 1000); // Fetch every second
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-bold">Live Price</h2>
      <div className="text-2xl font-bold text-green-600">
        {price !== null ? `₹${price.toFixed(2)}` : "Loading..."}
      </div>
    </div>
  );
}
