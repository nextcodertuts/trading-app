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
};

// WebSocket server setup (unchanged)
if (process.env.NODE_ENV !== "production") {
  const dev = process.env.NODE_ENV !== "production";
  const app = next({ dev });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    const wsPort = 3001;
    createServer((req, res) => {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    }).listen(wsPort, (err?: Error) => {
      if (err) throw err;
      console.log(`> WebSocket server ready on http://localhost:${wsPort}`);
    });
  });
}

export default nextConfig;
