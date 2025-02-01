/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";

interface WebSocketMessage {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  c: string; // Close price
  o: string; // Open price
  h: string; // High price
  l: string; // Low price
  v: string; // Volume
  t: number; // Kline start time
  T: number; // Kline close time
}

interface PriceData {
  symbol: string;
  price: number;
  klineData?: {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  };
}

const connections = new Map<string, WebSocket>();
const subscribers = new Map<string, Set<(data: PriceData) => void>>();

export function useBinanceWebSocket(symbol: string, timeframe?: string) {
  const [priceData, setPriceData] = useState<PriceData | null>(null);

  useEffect(() => {
    const formattedSymbol = symbol.toLowerCase();
    const endpoint = timeframe
      ? `${formattedSymbol}@kline_${timeframe}`
      : `${formattedSymbol}@ticker`;

    function subscribe(callback: (data: PriceData) => void) {
      if (!subscribers.has(endpoint)) {
        subscribers.set(endpoint, new Set());
      }
      subscribers.get(endpoint)?.add(callback);

      if (!connections.has(endpoint)) {
        const ws = new WebSocket(
          `wss://stream.binance.com:9443/ws/${endpoint}`
        );

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          const priceData: PriceData = timeframe
            ? {
                symbol,
                price: parseFloat(data.k.c),
                klineData: {
                  time: data.k.t,
                  open: parseFloat(data.k.o),
                  high: parseFloat(data.k.h),
                  low: parseFloat(data.k.l),
                  close: parseFloat(data.k.c),
                  volume: parseFloat(data.k.v),
                },
              }
            : {
                symbol,
                price: parseFloat(data.c),
              };

          subscribers.get(endpoint)?.forEach((cb) => cb(priceData));
        };

        ws.onerror = (error) => {
          console.error(`WebSocket error for ${endpoint}:`, error);
        };

        connections.set(endpoint, ws);
      }
    }

    function unsubscribe(callback: (data: PriceData) => void) {
      subscribers.get(endpoint)?.delete(callback);

      if (subscribers.get(endpoint)?.size === 0) {
        const ws = connections.get(endpoint);
        if (ws) {
          ws.close();
          connections.delete(endpoint);
          subscribers.delete(endpoint);
        }
      }
    }

    const callback = (data: PriceData) => setPriceData(data);
    subscribe(callback);

    return () => unsubscribe(callback);
  }, [symbol, timeframe]);

  return priceData;
}
