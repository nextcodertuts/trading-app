/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/market-data/route.ts
// @ts-nocheck

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const BINANCE_API_URL = "https://eapi.binance.com/eapi/v1";

async function fetchBinancePrice(symbol: string): Promise<number | null> {
  try {
    const response = await fetch(`${BINANCE_API_URL}/ticker?symbol=${symbol}`);
    if (!response.ok) throw new Error("Failed to fetch Binance price");
    const data = await response.json();

    return parseFloat(data[0].exercisePrice);
  } catch (error) {
    console.error("Error fetching Binance price:", error);
    return null;
  }
}

function manipulatePrice(basePrice: number, symbol: any): number {
  const { trend, volatility, bias, manipulationPercentage } = symbol;

  let manipulatedPrice =
    basePrice * (1 + (Math.random() * 2 - 1) * manipulationPercentage);

  switch (trend) {
    case "up":
      manipulatedPrice *= 1 + bias;
      break;
    case "down":
      manipulatedPrice *= 1 - bias;
      break;
    case "sideways":
      manipulatedPrice *= 1 + (Math.random() * 2 - 1) * bias * 0.5;
      break;
  }

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

    const manipulatedPrice = manipulatePrice(binancePrice, symbol);

    // Update symbol prices in database
    await prisma.symbol.update({
      where: { id: parseInt(symbolId) },
      data: {
        currentPrice: binancePrice,
        manipulatedPrice: manipulatedPrice,
        updatedAt: new Date(),
      },
    });

    // Store historical price
    const now = new Date();
    await prisma.historicalPrice.create({
      data: {
        symbolId: parseInt(symbolId),
        timestamp: Math.floor(now / 1000),
        open: manipulatedPrice,
        high: manipulatedPrice,
        low: manipulatedPrice,
        close: manipulatedPrice,
        volume: 0, // You might want to implement real volume tracking
      },
    });

    return NextResponse.json({
      symbol: symbol.name,
      currentPrice: binancePrice,
      manipulatedPrice: manipulatedPrice,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Market data error:", error);
    return NextResponse.json(
      { error: "Failed to process market data" },
      { status: 500 }
    );
  }
}
