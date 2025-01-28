import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";

// Middleware: Ensure admin access
async function isAdmin() {
  const { user } = await validateRequest();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return user;
}

export async function POST(req: Request) {
  const admin = await isAdmin();
  if (!admin) return;

  try {
    const {
      name,
      displayName,
      binanceSymbol,
      currentPrice,
      payout,
      enabled,
      trend,
      volatility,
      minAmount,
      maxAmount,
    } = await req.json();

    // Create default manipulation config
    const manipulationConfig = {
      trend: trend || "sideways",
      volatility: volatility || 1.0,
      bias: 0.02,
      manipulationPercentage: 0.1,
    };

    const newSymbol = await prisma.symbol.create({
      data: {
        name,
        displayName,
        binanceSymbol,
        currentPrice: parseFloat(currentPrice),
        manipulatedPrice: parseFloat(currentPrice), // Initially same as current price
        payout: parseFloat(payout),
        enabled,
        trend,
        volatility: parseFloat(volatility),
        minAmount: parseFloat(minAmount),
        maxAmount: parseFloat(maxAmount),
        manipulationConfig,
      },
    });

    return NextResponse.json({ symbol: newSymbol });
  } catch (error) {
    console.error("Failed to create symbol:", error);
    return NextResponse.json(
      { error: "Failed to create symbol" },
      { status: 500 }
    );
  }
}
