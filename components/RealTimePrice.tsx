// components/RealTimePrice.tsx

"use client";
import { useEffect, useState } from "react";

export default function RealTimePrice() {
  const symbol = "ETHUSDT";
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `wss://trading-server-production-a5cb.up.railway.app?symbol=${symbol}`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.symbol === symbol) {
        setPrice(data.price);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    return () => ws.close();
  }, []);

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg shadow-md text-center">
      <h2 className="text-xl font-bold">{symbol} Real-Time Price</h2>
      <p className="text-3xl mt-2 text-green-400">
        {price ? `$${price.toFixed(2)}` : "Loading..."}
      </p>
    </div>
  );
}
