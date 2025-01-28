/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const BINANCE_API_URL = "https://api.binance.com/api/v3";

async function fetchBinancePrice(symbol: string): Promise<number | null> {
  try {
    const response = await fetch(
      `${BINANCE_API_URL}/ticker/price?symbol=${symbol}`
    );
    if (!response.ok) throw new Error("Failed to fetch Binance price");
    const data = await response.json();
    return parseFloat(data.price);
  } catch (error) {
    console.error("Error fetching Binance price:", error);
    return null;
  }
}

function manipulatePrice(basePrice: number, config: any): number {
  const {
    trend = "sideways",
    volatility = 1.0,
    bias = 0,
    manipulationPercentage = 0.1,
  } = config;

  // Base manipulation
  let manipulatedPrice =
    basePrice * (1 + (Math.random() * 2 - 1) * manipulationPercentage);

  // Apply trend bias
  switch (trend) {
    case "up":
      manipulatedPrice *= 1 + bias;
      break;
    case "down":
      manipulatedPrice *= 1 - bias;
      break;
    case "sideways":
      // Random walk with smaller amplitude
      manipulatedPrice *= 1 + (Math.random() * 2 - 1) * bias * 0.5;
      break;
  }

  // Apply volatility
  manipulatedPrice *= 1 + (Math.random() * 2 - 1) * volatility * 0.01;

  return Number(manipulatedPrice.toFixed(2));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolId = searchParams.get("symbolId");

    if (!symbolId) {
      return NextResponse.json(
        { error: "Symbol ID is required" },
        { status: 400 }
      );
    }

    const symbol = await prisma.symbol.findUnique({
      where: { id: parseInt(symbolId) },
    });

    if (!symbol) {
      return NextResponse.json({ error: "Symbol not found" }, { status: 404 });
    }

    const binancePrice = await fetchBinancePrice(symbol.binanceSymbol);
    if (!binancePrice) {
      return NextResponse.json(
        { error: "Failed to fetch price" },
        { status: 500 }
      );
    }

    const manipulatedPrice = manipulatePrice(
      binancePrice,
      symbol.manipulationConfig
    );

    // Update symbol prices in database
    await prisma.symbol.update({
      where: { id: parseInt(symbolId) },
      data: {
        currentPrice: binancePrice,
        manipulatedPrice: manipulatedPrice,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      symbol: symbol.name,
      currentPrice: binancePrice,
      manipulatedPrice: manipulatedPrice,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Market data error:", error);
    return NextResponse.json(
      { error: "Failed to process market data" },
      { status: 500 }
    );
  }
}
