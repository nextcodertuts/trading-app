// components/TradingViewChart.tsx

"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
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
  const [chartLoaded, setChartLoaded] = useState(false);
  const widgetRef = useRef<any>(null);
  const isComponentMounted = useRef(true);

  const getCurrentPrice = useCallback(() => {
    return manipulatedPrice;
  }, [manipulatedPrice]);

  const getSymbolInfo = useCallback(() => {
    return selectedSymbol;
  }, [selectedSymbol]);

  useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || !selectedSymbol) return;

    const container = containerRef.current;

    const loadChart = () => {
      if (
        typeof window.TradingView === "undefined" ||
        !container ||
        !isComponentMounted.current
      )
        return;

      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (error) {
          console.error("Error removing previous widget:", error);
        }
      }

      const widgetOptions = {
        container_id: container.id,
        datafeed: createCustomDatafeed(getCurrentPrice, getSymbolInfo),
        symbol: selectedSymbol.name,
        interval: interval,
        timezone: "Etc/UTC",
        theme: theme === "dark" ? "dark" : "light",
        style: "1",
        locale: "en",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        hide_side_toolbar: false,
        allow_symbol_change: false,
        save_image: false,
        height: height,
        autosize: autosize,
        show_popup_button: false,
        popup_width: "1000",
        popup_height: "650",
        enabled_features: ["use_localstorage_for_settings"],
        disabled_features: [
          "header_symbol_search",
          "header_settings",
          "header_compare",
          "header_undo_redo",
          "header_screenshot",
          "header_saveload",
        ],
        overrides: {
          "mainSeriesProperties.candleStyle.upColor": "#26a69a",
          "mainSeriesProperties.candleStyle.downColor": "#ef5350",
          "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
          "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",
        },
        library_path: "https://s3.tradingview.com/tv.js",
      };

      try {
        widgetRef.current = new window.TradingView.widget(widgetOptions);
        widgetRef.current.onChartReady(() => {
          if (isComponentMounted.current) {
            setChartLoaded(true);
          }
        });
      } catch (error) {
        console.error("Error creating TradingView widget:", error);
      }
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
        try {
          widgetRef.current.remove();
        } catch (error) {
          console.error("Error removing widget on cleanup:", error);
        }
      }
      if (isComponentMounted.current) {
        setChartLoaded(false);
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
      id="tradingview_widget_container"
      ref={containerRef}
      className="w-full h-full rounded-lg overflow-hidden border border-border"
    />
  );
}
