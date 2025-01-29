/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react-hooks/exhaustive-deps */
// @ts-nocheck
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SMA, type Candle } from "@/lib/indicators";

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
  const smaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<string>("1m");
  const [showSMA, setShowSMA] = useState(false);
  const [smaPeriod, setSmaPeriod] = useState(14);
  const lastCandleRef = useRef<Candle | null>(null);

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
        updateSMA(data);
      }
    } catch (error) {
      console.error("Error loading historical data:", error);
    }
    setLoading(false);
  }, [selectedSymbol, timeFrame]);

  const updateSMA = (data: Candle[]) => {
    if (showSMA && smaSeriesRef.current) {
      SMA.update(smaSeriesRef.current, data, smaPeriod);
    }
  };

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
      height: 850,
      timeScale: {
        timeVisible: true,
        secondsVisible: timeFrame === "15s" || timeFrame === "30s",
      },
    });

    const candlestickSeries = chart.addCandlestickSeries();
    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    smaSeriesRef.current = SMA.addToChart(
      chart,
      showSMA,
      "rgba(4, 111, 232, 1)",
      2,
      smaPeriod
    );

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
  }, [selectedSymbol, timeFrame, fetchHistoricalData, smaPeriod, showSMA]);

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
      const newCandle: Candle = {
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

    // Update SMA
    if (showSMA && smaSeriesRef.current) {
      const data = seriesRef.current.data() as Candle[];
      SMA.update(smaSeriesRef.current, data, smaPeriod);
    }
  }, [manipulatedPrice, timeFrame, showSMA, smaPeriod]);

  const handleTimeFrameChange = (newTimeFrame: string) => {
    setTimeFrame(newTimeFrame);
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
      if (smaSeriesRef.current) {
        smaSeriesRef.current.applyOptions({ title: `SMA (${newPeriod})` });
      }
      fetchHistoricalData();
    }
  };

  if (!selectedSymbol) {
    return <div>Please select a trading symbol...</div>;
  }

  return (
    <div className="w-full h-[97%] rounded-lg overflow-hidden border border-border p-1">
      <div className="mb-4 flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-fit px-1">
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
      <div ref={chartContainerRef} />
    </div>
  );
}
