/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createChart,
  ColorType,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useBinanceWebSocket } from "@/lib/hooks/useBinanceWebSocket";

interface Symbol {
  id: number;
  name: string;
  displayName: string;
  payout: number;
}

interface Props {
  currentSymbol: Symbol;
  symbols: Symbol[];
}

export function TradingViewChart({ currentSymbol, symbols }: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const router = useRouter();
  const [timeFrame, setTimeFrame] = useState("1m");

  const priceData = useBinanceWebSocket(currentSymbol.name, timeFrame);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#333",
      },
      grid: {
        vertLines: { color: "#ddd" },
        horzLines: { color: "#ddd" },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: { timeVisible: true },
    });

    const candlestickSeries = chart.addCandlestickSeries();
    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // Update chart with new price data
  useEffect(() => {
    if (priceData?.klineData && candlestickSeriesRef.current) {
      candlestickSeriesRef.current.update(priceData.klineData);
    }
  }, [priceData]);

  // Fetch historical data when symbol or timeframe changes
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${currentSymbol.name.toUpperCase()}&interval=${timeFrame}&limit=1000`
        );
        const data = await response.json();

        const formattedData = data.map((candle: any) => ({
          time: candle[0] / 1000,
          open: parseFloat(candle[1]),
          high: parseFloat(candle[2]),
          low: parseFloat(candle[3]),
          close: parseFloat(candle[4]),
        }));

        if (candlestickSeriesRef.current) {
          candlestickSeriesRef.current.setData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching historical data:", error);
      }
    };

    fetchHistoricalData();
  }, [currentSymbol.name, timeFrame]);

  const handleSymbolChange = (symbolName: string) => {
    if (symbolName !== currentSymbol.name) {
      router.push(`/trading/${symbolName}`);
    }
  };

  return (
    <div className="w-full relative md:h-full h-[75vh] rounded-sm overflow-hidden border border-border p-1 flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {currentSymbol.displayName}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {symbols.map((symbol) => (
              <DropdownMenuItem
                key={symbol.id}
                onClick={() => handleSymbolChange(symbol.name)}
              >
                {symbol.displayName} ({symbol.payout}%)
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {timeFrame}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {["1m", "3m", "5m", "15m", "30m", "1h"].map((tf) => (
              <DropdownMenuItem key={tf} onClick={() => setTimeFrame(tf)}>
                {tf}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div ref={chartContainerRef} className="flex-grow" />
    </div>
  );
}
