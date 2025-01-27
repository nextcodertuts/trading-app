import { NextResponse } from "next/server";
import { WebSocketServer } from "ws";
import type { Server } from "http";

let wsServer: WebSocketServer | null = null;

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
      callback(Number.parseFloat(data.p)); // Binance sends price as "p"
    }
  };
  ws.onerror = (err) => console.error("Binance WebSocket error:", err);
  ws.onclose = () => console.log("Binance WebSocket connection closed.");
  return ws;
}

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

export async function GET(req: Request) {
  // Add CORS headers
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers });
  }

  if (!wsServer) {
    wsServer = new WebSocketServer({ noServer: true });

    wsServer.on("connection", (socket) => {
      console.log("Client connected to WebSocket.");

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

  return new NextResponse("WebSocket server running", { status: 200, headers });
}

export function websocketHandler(server: Server) {
  if (wsServer) {
    server.on("upgrade", (request, socket, head) => {
      wsServer?.handleUpgrade(request, socket, head, (ws) => {
        wsServer?.emit("connection", ws, request);
      });
    });
  }
}
