/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { Server } from "ws";
import { createServer } from "http";

const server = createServer();
const wss = new Server({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  // Simulate price updates
  const interval = setInterval(() => {
    const price = (Math.random() * (100 - 90) + 90).toFixed(2);
    ws.send(JSON.stringify({ type: "price", data: price }));
  }, 1000);

  ws.on("close", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

server.listen(8080, () => {
  console.log("WebSocket server is running on port 8080");
});
