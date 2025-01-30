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
import { useSymbol } from "@/lib/symbol-context";
import { useOrder } from "@/lib/order-context";
import { SymbolSelector } from "./SymbolSelector";

const timeFrameToSeconds: { [key: string]: number } = {
  "15s": 15,
  "30s": 30,
  "1m": 60,
  "3m": 180,
  "5m": 300,
};

export function TradingViewChart({
  symbolId,
  symbols,
  currentSymbol,
}: {
  symbolId: number;
}) {
  const { symbolData, setSymbolId } = useSymbol();
  const { orders } = useOrder();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<string>("1m");
  const [showSMA, setShowSMA] = useState(false);
  const [smaPeriod, setSmaPeriod] = useState(14);
  const [historicalData, setHistoricalData] = useState<Candle[]>([]);
  const lastCandleRef = useRef<Candle | null>(null);

  useEffect(() => {
    setSymbolId(symbolId);
  }, [symbolId, setSymbolId]);

  const fetchHistoricalData = useCallback(async () => {
    if (!symbolId) return;
    try {
      const response = await fetch(
        `/api/historical-data?symbolId=${symbolId}&resolution=${timeFrame}`
      );
      const data = await response.json();
      setHistoricalData(data);
      if (data.length > 0) {
        lastCandleRef.current = data[data.length - 1];
      }
    } catch (error) {
      console.error("Error loading historical data:", error);
    }
  }, [symbolId, timeFrame]);

  const updateSMA = useCallback(
    (data: Candle[]) => {
      if (!smaSeriesRef.current || !showSMA) return;
      const smaData = SMA(data, smaPeriod);
      smaSeriesRef.current.setData(smaData);
    },
    [smaPeriod, showSMA]
  );

  useEffect(() => {
    if (!chartContainerRef.current || !symbolId) return;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

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
      timeScale: {
        timeVisible: true,
        secondsVisible: timeFrame === "15s" || timeFrame === "30s",
      },
    });

    const candlestickSeries = chart.addCandlestickSeries();
    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    smaSeriesRef.current = chart.addLineSeries({
      color: "rgba(4, 111, 232, 1)",
      lineWidth: 2,
    });

    fetchHistoricalData();
    setLoading(false);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [symbolId, timeFrame, fetchHistoricalData]);

  useEffect(() => {
    if (seriesRef.current && historicalData.length > 0) {
      seriesRef.current.setData(historicalData);
      updateSMA(historicalData);
    }
  }, [historicalData, updateSMA]);

  useEffect(() => {
    if (!seriesRef.current || !symbolData || !lastCandleRef.current) return;

    const updateChart = () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const timeFrameSeconds = timeFrameToSeconds[timeFrame];
      const currentCandleTime =
        Math.floor(currentTime / timeFrameSeconds) * timeFrameSeconds;

      if (currentCandleTime === lastCandleRef.current.time) {
        // Update the current candle
        lastCandleRef.current.high = Math.max(
          lastCandleRef.current.high,
          symbolData.manipulatedPrice
        );
        lastCandleRef.current.low = Math.min(
          lastCandleRef.current.low,
          symbolData.manipulatedPrice
        );
        lastCandleRef.current.close = symbolData.manipulatedPrice;
      } else {
        // Create a new candle
        const newCandle: Candle = {
          time: currentCandleTime as UTCTimestamp,
          open: lastCandleRef.current.close,
          high: symbolData.manipulatedPrice,
          low: symbolData.manipulatedPrice,
          close: symbolData.manipulatedPrice,
          volume: 0, // We don't have real-time volume data
        };
        seriesRef.current.update(newCandle);
        lastCandleRef.current = newCandle;
      }

      seriesRef.current.update(lastCandleRef.current);

      // Update SMA
      updateSMA([...historicalData, lastCandleRef.current]);
    };

    const intervalId = setInterval(updateChart, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, [symbolData, timeFrame, updateSMA, historicalData]);

  useEffect(() => {
    if (!chartRef.current || !seriesRef.current || !orders.length) return;

    const markers = orders
      .filter((order) => order.symbolId === symbolId)
      .map((order) => ({
        time: order.timestamp as UTCTimestamp,
        position: order.direction === "up" ? "belowBar" : "aboveBar",
        color: order.direction === "up" ? "#2196F3" : "#FF4136",
        shape: "arrowUp",
        text: `${order.direction.toUpperCase()} @ ${order.price.toFixed(2)}`,
      }));

    seriesRef.current.setMarkers(markers);
  }, [orders, symbolId]);

  const handleTimeFrameChange = (newTimeFrame: string) => {
    setTimeFrame(newTimeFrame);
    fetchHistoricalData();
  };

  const toggleSMA = () => {
    setShowSMA(!showSMA);
    if (smaSeriesRef.current) {
      smaSeriesRef.current.applyOptions({ visible: !showSMA });
    }
  };

  const handleSmaPeriodChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newPeriod = Number.parseInt(event.target.value, 10);
    if (!isNaN(newPeriod) && newPeriod > 0) {
      setSmaPeriod(newPeriod);
      updateSMA(historicalData);
    }
  };

  if (!symbolId) {
    return <div>Please select a trading symbol...</div>;
  }

  return (
    <div className="w-full md:h-full h-[78vh] rounded-lg overflow-hidden border border-border p-1 flex flex-col">
      <div className="flex items-start gap-2 overflow-x-auto">
        <SymbolSelector symbols={symbols} currentSymbol={currentSymbol} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-fit p-1">
              {timeFrame} <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {Object.keys(timeFrameToSeconds).map((tf) => (
              <DropdownMenuItem
                key={tf}
                onSelect={() => handleTimeFrameChange(tf)}
              >
                {tf}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center space-x-2">
          <Switch
            id="sma-toggle"
            checked={showSMA}
            onCheckedChange={toggleSMA}
          />
          <Label htmlFor="sma-toggle">SMA</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="sma-period">Period:</Label>
          <Input
            id="sma-period"
            type="number"
            value={smaPeriod}
            onChange={handleSmaPeriodChange}
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
