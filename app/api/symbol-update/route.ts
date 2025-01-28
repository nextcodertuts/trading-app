// app/api/symbol-update/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, trend, volatility, bias, manipulationPercentage } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Symbol ID is required" },
        { status: 400 }
      );
    }

    const updatedSymbol = await prisma.symbol.update({
      where: { id: parseInt(id) },
      data: {
        trend: trend,
        volatility: parseFloat(volatility),
        bias: parseFloat(bias),
        manipulationPercentage: parseFloat(manipulationPercentage),
      },
    });

    return NextResponse.json(updatedSymbol);
  } catch (error) {
    console.error("Symbol update error:", error);
    return NextResponse.json(
      { error: "Failed to update symbol" },
      { status: 500 }
    );
  }
}
