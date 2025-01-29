// app/api/historical-data/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolId = searchParams.get("symbolId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const resolution = searchParams.get("resolution");

  if (!symbolId || !from || !to || !resolution) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const fromDate = new Date(parseInt(from) * 1000);
    const toDate = new Date(parseInt(to) * 1000);

    let interval;
    switch (resolution) {
      case "15S":
      case "30S":
        interval = { seconds: parseInt(resolution) };
        break;
      case "1":
        interval = { minutes: 1 };
        break;
      case "3":
      case "5":
      case "15":
      case "30":
        interval = { minutes: parseInt(resolution) };
        break;
      case "60":
      case "120":
      case "240":
        interval = { hours: parseInt(resolution) / 60 };
        break;
      case "D":
        interval = { days: 1 };
        break;
      default:
        return NextResponse.json(
          { error: "Invalid resolution" },
          { status: 400 }
        );
    }

    const historicalData = await prisma.historicalPrice.findMany({
      where: {
        symbolId: parseInt(symbolId),
        timestamp: {
          gte: fromDate,
          lte: toDate,
        },
      },
      orderBy: { timestamp: "asc" },
    });

    // Group and aggregate data based on the resolution
    const aggregatedData = [];
    let currentCandle = null;

    for (const price of historicalData) {
      const candleTime = new Date(price.timestamp);
      candleTime.setSeconds(0, 0); // Reset seconds and milliseconds

      // Adjust the candle time based on the interval
      if (interval.minutes) {
        candleTime.setMinutes(
          Math.floor(candleTime.getMinutes() / interval.minutes) *
            interval.minutes
        );
      } else if (interval.hours) {
        candleTime.setMinutes(0);
        candleTime.setHours(
          Math.floor(candleTime.getHours() / interval.hours) * interval.hours
        );
      } else if (interval.days) {
        candleTime.setMinutes(0);
        candleTime.setHours(0);
      }

      if (!currentCandle || currentCandle.time !== candleTime.getTime()) {
        if (currentCandle) {
          aggregatedData.push(currentCandle);
        }
        currentCandle = {
          time: candleTime.getTime(),
          open: price.open,
          high: price.high,
          low: price.low,
          close: price.close,
          volume: price.volume,
        };
      } else {
        currentCandle.high = Math.max(currentCandle.high, price.high);
        currentCandle.low = Math.min(currentCandle.low, price.low);
        currentCandle.close = price.close;
        currentCandle.volume += price.volume;
      }
    }

    if (currentCandle) {
      aggregatedData.push(currentCandle);
    }

    return NextResponse.json(aggregatedData);
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return NextResponse.json(
      { error: "Failed to fetch historical data" },
      { status: 500 }
    );
  }
}
