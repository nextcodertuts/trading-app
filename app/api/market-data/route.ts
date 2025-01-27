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

async function manipulatePrice(
  basePrice: number,
  symbolId: number
): Promise<number> {
  const symbol = await prisma.symbol.findUnique({
    where: { id: symbolId },
  });

  if (!symbol) return basePrice;

  let manipulatedPrice = basePrice;
  const volatilityFactor = symbol.volatility / 100;

  switch (symbol.trend) {
    case "up":
      manipulatedPrice *= 1 + volatilityFactor;
      break;
    case "down":
      manipulatedPrice *= 1 - volatilityFactor;
      break;
    case "volatile":
      const randomFactor = (Math.random() * 2 - 1) * volatilityFactor;
      manipulatedPrice *= 1 + randomFactor;
      break;
  }

  return Number(manipulatedPrice.toFixed(2));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolId = searchParams.get("symbolId");
    const binanceSymbol = searchParams.get("binanceSymbol") || "BTCUSDT";

    if (!symbolId) {
      return NextResponse.json(
        { error: "Symbol ID is required" },
        { status: 400 }
      );
    }

    const basePrice = await fetchBinancePrice(binanceSymbol);
    if (!basePrice) {
      return NextResponse.json(
        { error: "Failed to fetch base price" },
        { status: 500 }
      );
    }

    const manipulatedPrice = await manipulatePrice(
      basePrice,
      parseInt(symbolId)
    );

    return NextResponse.json({
      basePrice,
      manipulatedPrice,
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
