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

    const loadChart = () => {
      if (typeof window.TradingView === "undefined" || !container) return;

      if (widgetRef.current) {
        widgetRef.current.remove();
      }

      const widgetOptions = {
        symbol: selectedSymbol.name,
        datafeed: createCustomDatafeed(getCurrentPrice, getSymbolInfo),
        interval: interval,
        container_id: container.id,
        library_path: "https://s3.tradingview.com/tv.js/",
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
      };

      const tvWidget = new window.TradingView.widget(widgetOptions);
      widgetRef.current = tvWidget;

      tvWidget.onChartReady(() => {
        console.log("Chart is ready");
      });
    };

    if (window.TradingView) {
      loadChart();
    } else {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = loadChart;
      document.head.appendChild(script);
    }

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
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
      id="tradingview_chart_container"
      ref={containerRef}
      className="w-full h-full rounded-lg overflow-hidden border border-border"
    />
  );
}
