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

// GET: Fetch all symbols with pagination
export async function GET(req: Request) {
  const admin = await isAdmin();
  if (!admin) return;

  const url = new URL(req.url);
  const page = Number.parseInt(url.searchParams.get("page") || "1");
  const limit = Number.parseInt(url.searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  try {
    const [symbols, totalCount] = await Promise.all([
      prisma.symbol.findMany({
        skip,
        take: limit,
      }),
      prisma.symbol.count(),
    ]);

    return NextResponse.json({ symbols, totalCount });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch symbols" },
      { status: 500 }
    );
  }
}

// POST: Create a new symbol
export async function POST(req: Request) {
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

    const newSymbol = await prisma.symbol.create({
      data: { name, currentPrice, payout, enabled, trend, volatility, status },
    });
    return NextResponse.json({ symbol: newSymbol });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create symbol" },
      { status: 500 }
    );
  }
}
