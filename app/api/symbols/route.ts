import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Get All Symbols
export async function GET() {
  const symbols = await prisma.symbol.findMany();
  return NextResponse.json(symbols);
}

// Add or Update a Symbol (Admin-only)
export async function POST(req: Request) {
  const { id, name, currentPrice, payout, enabled } = await req.json();

  const symbol = await prisma.symbol.upsert({
    where: { id: id || 0 }, // Upsert by ID
    update: { name, currentPrice, payout, enabled },
    create: { name, currentPrice, payout, enabled },
  });

  return NextResponse.json(symbol);
}
