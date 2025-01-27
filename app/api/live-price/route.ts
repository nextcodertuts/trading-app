import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Base Binance API URL
const BINANCE_API_URL = "https://api.binance.com/api/v3/ticker/price";

// Helper to fetch live price from Binance API
const fetchLivePrice = async (symbol: string): Promise<number | null> => {
  try {
    const response = await fetch(`${BINANCE_API_URL}?symbol=${symbol}`);
    if (!response.ok) {
      throw new Error("Failed to fetch live price");
    }
    const data = await response.json();
    return parseFloat(data.price); // Return the live price
  } catch (error) {
    console.error(`Error fetching live price for ${symbol}:`, error);
    return null; // Return null if fetching fails
  }
};

// GET all symbols or a specific symbol, including live price
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolId = searchParams.get("id");

  try {
    if (symbolId) {
      // Fetch a specific symbol
      const symbol = await prisma.symbol.findUnique({
        where: { id: parseInt(symbolId, 10) },
        include: { orders: true },
      });

      if (!symbol) {
        return NextResponse.json(
          { error: "Symbol not found" },
          { status: 404 }
        );
      }

      // Fetch live price if the symbol is enabled
      const livePrice = symbol.enabled
        ? await fetchLivePrice(symbol.name.replace("/", ""))
        : null;

      return NextResponse.json({
        ...symbol,
        livePrice: livePrice || symbol.currentPrice, // Use live price if available
      });
    }

    // Fetch all symbols
    const symbols = await prisma.symbol.findMany();
    const updatedSymbols = await Promise.all(
      symbols.map(async (symbol) => {
        const livePrice = symbol.enabled
          ? await fetchLivePrice(symbol.name.replace("/", ""))
          : null;
        return {
          ...symbol,
          livePrice: livePrice || symbol.currentPrice, // Include live price if available
        };
      })
    );

    return NextResponse.json(updatedSymbols);
  } catch (error) {
    console.error("Error fetching symbols:", error);
    return NextResponse.json(
      { error: "Failed to fetch symbols" },
      { status: 500 }
    );
  }
}

// PATCH to update symbol properties
export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, name, payout, trend, volatility, status, enabled } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Symbol ID is required" },
      { status: 400 }
    );
  }

  try {
    const updatedSymbol = await prisma.symbol.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(payout && { payout }),
        ...(trend && { trend }),
        ...(volatility && { volatility }),
        ...(status && { status }),
        ...(enabled !== undefined && { enabled }),
      },
    });

    return NextResponse.json(updatedSymbol);
  } catch (error) {
    console.error("Error updating symbol:", error);
    return NextResponse.json(
      { error: "Failed to update symbol" },
      { status: 500 }
    );
  }
}

// POST to fetch simulated price with trend/volatility OR live price
export async function POST(request: Request) {
  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Symbol ID is required" },
      { status: 400 }
    );
  }

  try {
    const symbol = await prisma.symbol.findUnique({
      where: { id },
    });

    if (!symbol) {
      return NextResponse.json({ error: "Symbol not found" }, { status: 404 });
    }

    // Fetch live price if the symbol is enabled
    const livePrice = symbol.enabled
      ? await fetchLivePrice(symbol.name.replace("/", ""))
      : null;

    // Simulate price if live price is unavailable
    let simulatedPrice = symbol.currentPrice;
    if (!livePrice) {
      const { currentPrice, trend, volatility } = symbol;

      if (trend === "up") {
        simulatedPrice = currentPrice * (1 + volatility / 100);
      } else if (trend === "down") {
        simulatedPrice = currentPrice * (1 - volatility / 100);
      } else if (trend === "volatile") {
        const randomFactor = ((Math.random() * 2 - 1) * volatility) / 100; // Generate -volatility% to +volatility%
        simulatedPrice = currentPrice * (1 + randomFactor);
      }
    }

    return NextResponse.json({
      id: symbol.id,
      name: symbol.name,
      price: livePrice || parseFloat(simulatedPrice.toFixed(2)),
      trend: symbol.trend,
      volatility: symbol.volatility,
    });
  } catch (error) {
    console.error("Error simulating price:", error);
    return NextResponse.json(
      { error: "Failed to simulate price" },
      { status: 500 }
    );
  }
}
