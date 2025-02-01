/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
  LineStyle,
} from "lightweight-charts";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SMA, type Candle } from "@/lib/indicators";
import { SymbolSelector } from "./SymbolSelector";

const timeFrameMapping = {
  "15s": "15s",
  "30s": "30s",
  "1m": "1m",
  "3m": "3m",
  "5m": "5m",
};

export function TradingViewChart({ currentSymbol }: { currentSymbol: string }) {
  console.log("symbol tradingview chart", currentSymbol);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<string>("1m");
  const [showSMA, setShowSMA] = useState(false);
  const [smaPeriod, setSmaPeriod] = useState(14);
  const [historicalData, setHistoricalData] = useState<Candle[]>([]);

  const fetchHistoricalData = useCallback(async () => {
    if (!currentSymbol) return;
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${currentSymbol.toUpperCase()}&interval=${timeFrame}&limit=100`
      );
      const data = await response.json();
      const formattedData = data.map((candle: any) => ({
        time: candle[0] / 1000,
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
      }));
      setHistoricalData(formattedData);
    } catch (error) {
      console.error("Error fetching Binance historical data:", error);
    }
  }, [currentSymbol, timeFrame]);

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
    seriesRef.current = candlestickSeries;
    smaSeriesRef.current = chart.addLineSeries({
      color: "#046FE8",
      lineWidth: 2,
    });

    fetchHistoricalData();
    setLoading(false);

    return () => chart.remove();
  }, [fetchHistoricalData]);

  useEffect(() => {
    if (seriesRef.current && historicalData.length > 0) {
      seriesRef.current.setData(historicalData);
    }
  }, [historicalData]);

  useEffect(() => {
    if (wsRef.current) wsRef.current.close();

    wsRef.current = new WebSocket(
      `wss://stream.binance.com:9443/ws/${currentSymbol.toLowerCase()}@kline_${timeFrame}`
    );

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const kline = data.k;
      if (seriesRef.current) {
        seriesRef.current.update({
          time: kline.t / 1000,
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
        });
      }
    };

    return () => wsRef.current?.close();
  }, [currentSymbol, timeFrame]);

  return (
    <div className="w-full relative md:h-full h-[75vh] rounded-sm overflow-hidden border border-border p-1 flex flex-col">
      <div className="flex items-start gap-2 h-12 md:static absolute top-0 p-1 left-0 z-50">
        <SymbolSelector selectedSymbol={currentSymbol} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-fit p-1">
              {timeFrame} <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {Object.keys(timeFrameMapping).map((tf) => (
              <DropdownMenuItem key={tf} onSelect={() => setTimeFrame(tf)}>
                {tf}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center space-x-2">
          <Switch
            id="sma-toggle"
            checked={showSMA}
            onCheckedChange={() => setShowSMA(!showSMA)}
          />
          <Label htmlFor="sma-toggle">SMA</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="sma-period">Period:</Label>
          <Input
            id="sma-period"
            type="number"
            value={smaPeriod}
            onChange={(e) => setSmaPeriod(Number(e.target.value))}
            className="w-16"
            min="1"
          />
        </div>
      </div>
      {loading ? <p>Loading chart...</p> : null}
      <div ref={chartContainerRef} className="flex-grow border rounded-sm" />
    </div>
  );
}
