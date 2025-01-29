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
  if (!admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

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
      bias,
      manipulationPercentage,
      minAmount,
      maxAmount,
    } = await req.json();

    // Remove spaces from sensitive properties
    const sanitizedData = {
      name: name.trim().replace(/\s+/g, ""),
      displayName: displayName.trim(),
      binanceSymbol: binanceSymbol.trim().replace(/\s+/g, ""),
      currentPrice: Number.parseFloat(currentPrice),
      manipulatedPrice: Number.parseFloat(currentPrice), // Initially same as current price
      payout: Number.parseFloat(payout),
      enabled,
      trend: trend.trim().toLowerCase(),
      volatility: Number.parseFloat(volatility),
      bias: Number.parseFloat(bias),
      manipulationPercentage: Number.parseFloat(manipulationPercentage),
      minAmount: Number.parseFloat(minAmount),
      maxAmount: Number.parseFloat(maxAmount),
    };

    // Validate trend
    if (!["up", "down", "sideways"].includes(sanitizedData.trend)) {
      return NextResponse.json(
        { error: "Invalid trend value" },
        { status: 400 }
      );
    }

    const newSymbol = await prisma.symbol.create({
      data: sanitizedData,
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
