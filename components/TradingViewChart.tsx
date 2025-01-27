/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewChartProps {
  symbol: string;
  interval?: string;
  theme?: "light" | "dark";
  autosize?: boolean;
  height?: number;
}

export function TradingViewChart({
  symbol = "BTCUSDT",
  interval = "1",
  height = 600,
  autosize = true,
}: TradingViewChartProps) {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!container.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView !== "undefined" && container.current) {
        new window.TradingView.widget({
          container_id: container.current.id,
          symbol: `BINANCE:${symbol}`,
          interval: interval,
          timezone: "Etc/UTC",
          theme: theme === "dark" ? "dark" : "light",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          save_image: false,
          height: height,
          autosize: autosize,
          show_popup_button: true,
          popup_width: "1000",
          popup_height: "650",
        });
      }
    };
    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = "";
      }
    };
  }, [symbol, interval, theme, height, autosize]);

  return (
    <div
      id="tradingview_widget_container"
      ref={container}
      className="w-full h-full rounded-lg overflow-hidden border border-border"
    />
  );
}
