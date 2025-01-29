/* eslint-disable @typescript-eslint/no-explicit-any */
// components/TradingViewChart.tsx

"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { useTrading } from "@/lib/trading-context";
import { createCustomDatafeed } from "@/lib/customDatafeed";

interface TradingViewChartProps {
  interval?: string;
  height?: number;
  autosize?: boolean;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

export function TradingViewChart({
  interval = "1",
  height = 600,
  autosize = true,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const { selectedSymbol, manipulatedPrice } = useTrading();
  const widgetRef = useRef<any>(null);

  const getCurrentPrice = useCallback(() => {
    return manipulatedPrice;
  }, [manipulatedPrice]);

  const getSymbolInfo = useCallback(() => {
    return selectedSymbol;
  }, [selectedSymbol]);

  useEffect(() => {
    if (!containerRef.current || !selectedSymbol) return;

    const container = containerRef.current;
    const containerId =
      "tradingview_" + Math.random().toString(36).substring(7);
    container.id = containerId;

    const loadChart = () => {
      if (typeof window.TradingView === "undefined") return;

      // Clean up previous widget if it exists
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }

      // Ensure container still exists
      if (!document.getElementById(containerId)) return;

      try {
        const widgetOptions = {
          symbol: selectedSymbol.name,
          datafeed: createCustomDatafeed(getCurrentPrice, getSymbolInfo),
          interval: interval,
          container_id: containerId,
          library_path: "/static/charting_library/",
          locale: "en",
          disabled_features: ["use_localstorage_for_settings"],
          enabled_features: ["study_templates"],
          charts_storage_url: "https://saveload.tradingview.com",
          charts_storage_api_version: "1.1",
          client_id: "tradingview.com",
          user_id: "public_user_id",
          fullscreen: false,
          autosize: autosize,
          height: height,
          theme: theme === "dark" ? "Dark" : "Light",
          loading_screen: { backgroundColor: "#131722" },
        };

        const tvWidget = new window.TradingView.widget(widgetOptions);
        widgetRef.current = tvWidget;
      } catch (error) {
        console.error("Error initializing TradingView widget:", error);
      }
    };

    // Load TradingView library if not already loaded
    if (!window.TradingView) {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = () => {
        // Small delay to ensure DOM is ready
        setTimeout(loadChart, 100);
      };
      document.head.appendChild(script);
    } else {
      // Small delay to ensure DOM is ready
      setTimeout(loadChart, 100);
    }

    // Cleanup function
    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
    };
  }, [
    interval,
    theme,
    height,
    autosize,
    selectedSymbol,
    getCurrentPrice,
    getSymbolInfo,
  ]);

  if (!selectedSymbol) {
    return <div>Please select a trading symbol...</div>;
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-lg overflow-hidden border border-border"
    />
  );
}
