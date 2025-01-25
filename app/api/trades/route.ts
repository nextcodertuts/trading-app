import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { symbolId, amount, direction, expiresAt } = await request.json();

    // Validate inputs
    if (!symbolId || !amount || !direction || !expiresAt) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const symbol = await prisma.symbol.findUnique({ where: { id: symbolId } });
    if (!symbol || !symbol.enabled) {
      return NextResponse.json(
        { error: "Symbol not available for trading" },
        { status: 400 }
      );
    }

    // Place the order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        symbolId,
        amount,
        direction,
        entryPrice: symbol.currentPrice,
        expiresAt: new Date(expiresAt),
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to place trade" },
      { status: 500 }
    );
  }
}
