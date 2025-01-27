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

// PUT: Update a symbol
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await isAdmin();
  if (!admin) return;

  try {
    const { name, currentPrice, payout, enabled, trend, volatility, status } =
      await req.json();

    // Validate trend
    if (trend && !["up", "down", "volatile"].includes(trend)) {
      return NextResponse.json(
        { error: "Invalid trend value" },
        { status: 400 }
      );
    }

    const updatedSymbol = await prisma.symbol.update({
      where: { id: Number.parseInt(id) },
      data: { name, currentPrice, payout, enabled, trend, volatility, status },
    });
    return NextResponse.json({ symbol: updatedSymbol });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update symbol" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a symbol
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await isAdmin();
  if (!admin) return;

  try {
    await prisma.symbol.delete({
      where: { id: Number.parseInt(id) },
    });
    return NextResponse.json({ message: "Symbol deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete symbol" },
      { status: 500 }
    );
  }
}
