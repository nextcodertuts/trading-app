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
    const historicalData = await prisma.historicalPrice.findMany({
      where: {
        symbolId: parseInt(symbolId),
        timestamp: {
          gte: parseInt(from),
          lte: parseInt(to),
        },
      },
      orderBy: { timestamp: "asc" },
    });

    const aggregatedData = [];
    let currentIntervalStart: number | null = null;
    let currentOpen: number | null = null;
    let currentHigh = -Infinity;
    let currentLow = Infinity;
    let currentClose: number | null = null;
    let currentVolume = 0;

    const getIntervalStart = (timestamp: number): number => {
      switch (resolution) {
        case "15S":
          return timestamp - (timestamp % 15);
        case "30S":
          return timestamp - (timestamp % 30);
        case "1":
          return timestamp - (timestamp % 60);
        case "3":
          return timestamp - (timestamp % 180);
        case "5":
          return timestamp - (timestamp % 300);
        case "15":
          return timestamp - (timestamp % 900);
        case "30":
          return timestamp - (timestamp % 1800);
        case "60":
          return timestamp - (timestamp % 3600);
        case "D": {
          const date = new Date(timestamp * 1000);
          date.setUTCHours(0, 0, 0, 0);
          return Math.floor(date.getTime() / 1000);
        }
        default:
          return timestamp;
      }
    };

    for (const price of historicalData) {
      const intervalStart = getIntervalStart(price.timestamp);

      if (currentIntervalStart !== intervalStart) {
        if (currentIntervalStart !== null) {
          aggregatedData.push({
            time: currentIntervalStart,
            open: currentOpen!,
            high: currentHigh,
            low: currentLow,
            close: currentClose!,
            volume: currentVolume,
          });
        }

        currentIntervalStart = intervalStart;
        currentOpen = price.close;
        currentHigh = price.close;
        currentLow = price.close;
        currentClose = price.close;
        currentVolume = price.volume;
      } else {
        currentHigh = Math.max(currentHigh, price.close);
        currentLow = Math.min(currentLow, price.close);
        currentClose = price.close;
        currentVolume += price.volume;
      }
    }

    if (currentIntervalStart !== null) {
      aggregatedData.push({
        time: currentIntervalStart,
        open: currentOpen!,
        high: currentHigh,
        low: currentLow,
        close: currentClose!,
        volume: currentVolume,
      });
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
