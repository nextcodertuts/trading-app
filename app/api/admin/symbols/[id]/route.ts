/* eslint-disable @typescript-eslint/no-unused-vars */
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

// GET: Fetch a specific symbol
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await isAdmin();
  if (!admin) return;

  try {
    const symbol = await prisma.symbol.findUnique({
      where: { id: Number.parseInt(id) },
    });
    if (!symbol) {
      return NextResponse.json({ error: "Symbol not found" }, { status: 404 });
    }
    return NextResponse.json({ symbol });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch symbol" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
      bias,
      manipulationPercentage,
      minAmount,
      maxAmount,
    } = await req.json();

    // Validate trend
    if (trend && !["up", "down", "sideways"].includes(trend)) {
      return NextResponse.json(
        { error: "Invalid trend value" },
        { status: 400 }
      );
    }

    const updatedSymbol = await prisma.symbol.update({
      where: { id: Number.parseInt(id) },
      data: {
        name,
        displayName,
        binanceSymbol,
        currentPrice: Number.parseFloat(currentPrice),
        payout: Number.parseFloat(payout),
        enabled,
        trend,
        volatility: Number.parseFloat(volatility),
        bias: Number.parseFloat(bias),
        manipulationPercentage: Number.parseFloat(manipulationPercentage),
        minAmount: Number.parseFloat(minAmount),
        maxAmount: Number.parseFloat(maxAmount),
      },
    });
    return NextResponse.json({ symbol: updatedSymbol });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update symbol" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await isAdmin();
  if (!admin) return;

  try {
    const deletedSymbol = await prisma.symbol.delete({
      where: { id: Number.parseInt(id) },
    });
    return NextResponse.json({ symbol: deletedSymbol });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete symbol" },
      { status: 500 }
    );
  }
}
