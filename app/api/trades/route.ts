/* eslint-disable @typescript-eslint/no-unused-vars */
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

    // Fetch user's current balance
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balance: true },
    });

    if (!dbUser || dbUser.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Start a transaction
    const [order, _] = await prisma.$transaction([
      // Create the order
      prisma.order.create({
        data: {
          userId: user.id,
          symbolId,
          amount,
          direction,
          entryPrice: 0, // Will be updated by the price feed
          expiresAt: new Date(expiresAt),
        },
      }),
      // Update user's balance
      prisma.user.update({
        where: { id: user.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      }),
    ]);

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Error placing trade:", error);
    return NextResponse.json(
      { error: "Failed to place trade" },
      { status: 500 }
    );
  }
}
