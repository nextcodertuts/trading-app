/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import type { NextConfig } from "next";
import { createServer } from "http";
import { parse } from "url";
import next from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
      };
    }
    return config;
  },
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true,
  },
};

// WebSocket server setup (unchanged)
if (process.env.NODE_ENV !== "production") {
  const dev = process.env.NODE_ENV !== "production";
  const app = next({ dev });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    const wsPort = 3001;
    const server = createServer((req, res) => {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    });

    server.on("error", (err: Error) => {
      if ((err as any).code === "EADDRINUSE") {
        console.error(
          `Port ${wsPort} is already in use. Please check if another process is using it or try again later.`
        );
      } else {
        console.error("Error starting WebSocket server:", err);
      }
    });

    server.listen(wsPort, (err?: Error) => {
      if (err) throw err;
      console.log(`> WebSocket server ready on http://localhost:${wsPort}`);
    });
  });
}

export default nextConfig;
