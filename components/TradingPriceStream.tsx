"use client";
import { useEffect, useState } from "react";

const TradingPriceStream = () => {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_BASE_URL || "");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data?.price) setPrice(data.price);
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);
    ws.onclose = () => console.log("WebSocket connection closed.");

    return () => ws.close();
  }, []);

  return <div>Live Price: {price ? `$${price}` : "Loading..."}</div>;
};

export default TradingPriceStream;
