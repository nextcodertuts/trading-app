/* eslint-disable @typescript-eslint/no-unused-vars */
import { WebSocketServer } from "ws";
import { NextApiRequest, NextApiResponse } from "next";
import type { Server } from "http";

let wsServer: WebSocketServer | null = null;

// Function to fetch Binance WebSocket prices
function createBinanceWebSocket(
  symbol: string,
  callback: (price: number) => void
) {
  const ws = new WebSocket(
    `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`
  );
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data && data.p) {
      callback(parseFloat(data.p)); // Binance sends price as "p"
    }
  };
  ws.onerror = (err) => console.error("Binance WebSocket error:", err);
  ws.onclose = () => console.log("Binance WebSocket connection closed.");
  return ws;
}

// Function to manipulate the price
function manipulatePrice(
  price: number,
  trend: string,
  volatility: number
): number {
  let manipulatedPrice = price;
  if (trend === "up") {
    manipulatedPrice += (price * (Math.random() * volatility)) / 100;
  } else if (trend === "down") {
    manipulatedPrice -= (price * (Math.random() * volatility)) / 100;
  }
  return Math.max(manipulatedPrice, 0); // Ensure price is never negative
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!wsServer) {
    wsServer = new WebSocketServer({ noServer: true });

    wsServer.on("connection", (socket) => {
      console.log("Client connected to WebSocket.");

      // Example: Symbol, trend, and volatility could come from an admin-controlled configuration
      const symbol = "BTCUSDT"; // Default to BTC/USDT
      const trend = "up"; // Admin-defined trend
      const volatility = 1.5; // Admin-defined volatility

      const binanceWS = createBinanceWebSocket(symbol, (price) => {
        const manipulatedPrice = manipulatePrice(price, trend, volatility);
        socket.send(JSON.stringify({ price: manipulatedPrice, symbol }));
      });

      socket.on("close", () => {
        console.log("Client disconnected.");
        binanceWS.close();
      });
    });

    console.log("WebSocket server initialized.");
  }

  res.end(); // This API endpoint just sets up the WebSocket server
}

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for WebSocket routes
  },
};

// Attach the WebSocket server to Next.js HTTP server
export const websocketHandler = (server: Server) => {
  if (wsServer) {
    wsServer.handleUpgrade = (req, socket, head) => {
      wsServer?.handleUpgrade(req, socket, head, (ws) => {
        wsServer?.emit("connection", ws, req);
      });
    };
  }
};
