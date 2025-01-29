"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { useTrading } from "@/lib/trading-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const timeFrameToSeconds: { [key: string]: number } = {
  "15s": 15,
  "30s": 30,
  "1m": 60,
  "3m": 180,
  "5m": 300,
};

export function TradingViewChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { selectedSymbol, manipulatedPrice } = useTrading();
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<string>("1m");
  const lastCandleRef = useRef<{
    time: UTCTimestamp;
    open: number;
    high: number;
    low: number;
    close: number;
  } | null>(null);

  const fetchHistoricalData = useCallback(async () => {
    if (!selectedSymbol) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/historical-data?symbolId=${selectedSymbol.id}&resolution=${timeFrame}`
      );
      const data = await response.json();
      if (seriesRef.current) {
        seriesRef.current.setData(data);
        if (data.length > 0) {
          lastCandleRef.current = data[data.length - 1];
        }
      }
    } catch (error) {
      console.error("Error loading historical data:", error);
    }
    setLoading(false);
  }, [selectedSymbol, timeFrame]);

  useEffect(() => {
    if (!chartContainerRef.current || !selectedSymbol) return;

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
      height: 750,
      timeScale: {
        timeVisible: true,
        secondsVisible: timeFrame === "15s" || timeFrame === "30s",
      },
    });

    const candlestickSeries = chart.addCandlestickSeries();
    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    fetchHistoricalData();

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [selectedSymbol, timeFrame, fetchHistoricalData]);

  useEffect(() => {
    if (!seriesRef.current || !manipulatedPrice || !lastCandleRef.current)
      return;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeFrameSeconds = timeFrameToSeconds[timeFrame];
    const currentCandleTime =
      Math.floor(currentTime / timeFrameSeconds) * timeFrameSeconds;

    if (currentCandleTime === lastCandleRef.current.time) {
      // Update the current candle
      lastCandleRef.current.high = Math.max(
        lastCandleRef.current.high,
        manipulatedPrice
      );
      lastCandleRef.current.low = Math.min(
        lastCandleRef.current.low,
        manipulatedPrice
      );
      lastCandleRef.current.close = manipulatedPrice;
    } else {
      // Create a new candle
      const newCandle = {
        time: currentCandleTime as UTCTimestamp,
        open: lastCandleRef.current.close,
        high: manipulatedPrice,
        low: manipulatedPrice,
        close: manipulatedPrice,
      };
      seriesRef.current.update(newCandle);
      lastCandleRef.current = newCandle;
    }

    seriesRef.current.update(lastCandleRef.current);
  }, [manipulatedPrice, timeFrame]);

  const handleTimeFrameChange = (newTimeFrame: string) => {
    setTimeFrame(newTimeFrame);
  };

  if (!selectedSymbol) {
    return <div>Please select a trading symbol...</div>;
  }

  return (
    <div className="w-full h-[95%] rounded-lg overflow-hidden border border-border p-1">
      <div className="mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-fit px-1">
              {timeFrame} <ChevronDown className=" h-4 w-4" />
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
      </div>
      {loading ? <p>Loading chart...</p> : null}
      <div ref={chartContainerRef} />
    </div>
  );
}
