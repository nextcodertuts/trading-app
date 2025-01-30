import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolId = searchParams.get("symbolId");

  if (!symbolId) {
    return NextResponse.json(
      { error: "Missing symbolId parameter" },
      { status: 400 }
    );
  }

  try {
    const symbol = await prisma.symbol.findUnique({
      where: { id: Number(symbolId) },
      select: {
        id: true,
        name: true,
        displayName: true,
        currentPrice: true,
        manipulatedPrice: true,
      },
    });

    if (!symbol) {
      return NextResponse.json({ error: "Symbol not found" }, { status: 404 });
    }

    return NextResponse.json(symbol);
  } catch (error) {
    console.error("Error fetching symbol data:", error);
    return NextResponse.json(
      { error: "Failed to fetch symbol data" },
      { status: 500 }
    );
  }
}
