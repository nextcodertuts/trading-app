/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth"; // Import your auth library

// Create a New Order
export async function POST(req: Request) {
  const { user, session } = await validateRequest();
  if (!session || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { symbolId, amount, direction, expiresAt, entryPrice } =
    await req.json();

  try {
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        symbolId,
        amount,
        direction,
        expiresAt,
        entryPrice,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "open" or "historical"

    let orders;

    if (status === "open") {
      // Fetch open orders
      orders = await prisma.order.findMany({
        where: {
          userId: user.id,
          outcome: null, // Outcome is null for open orders
        },
        include: { symbol: true },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Fetch historical orders
      orders = await prisma.order.findMany({
        where: {
          userId: user.id,
          outcome: { not: null }, // Historical orders have a non-null outcome
        },
        include: { symbol: true },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
