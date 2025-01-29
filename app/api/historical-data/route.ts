/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const timeFrameToSeconds: { [key: string]: number } = {
  "15s": 15,
  "30s": 30,
  "1m": 60,
  "3m": 180,
  "5m": 300,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolId = searchParams.get("symbolId");
  const resolution = searchParams.get("resolution");

  if (!symbolId || !resolution) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const historicalData = await prisma.historicalPrice.findMany({
      where: {
        symbolId: Number.parseInt(symbolId),
      },
      orderBy: { timestamp: "asc" },
    });

    const timeFrameSeconds = timeFrameToSeconds[resolution];
    const aggregatedData = [];
    let currentCandle: any = null;

    for (const price of historicalData) {
      const candleTime =
        Math.floor(price.timestamp / timeFrameSeconds) * timeFrameSeconds;

      if (!currentCandle || candleTime !== currentCandle.time) {
        if (currentCandle) {
          aggregatedData.push(currentCandle);
        }
        currentCandle = {
          time: candleTime,
          open: price.close,
          high: price.close,
          low: price.close,
          close: price.close,
          volume: price.volume,
        };
      } else {
        currentCandle.high = Math.max(currentCandle.high, price.close);
        currentCandle.low = Math.min(currentCandle.low, price.close);
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
