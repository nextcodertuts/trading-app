import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";

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
      // Fetch open orders (orders with no outcome)
      orders = await prisma.order.findMany({
        where: {
          userId: user.id,
          outcome: null, // Outcome is null for open orders
          expiresAt: {
            gt: new Date(), // Not expired yet
          },
        },
        include: {
          symbol: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Fetch historical orders (completed orders with outcomes)
      orders = await prisma.order.findMany({
        where: {
          userId: user.id,
          NOT: {
            outcome: null,
          },
        },
        include: {
          symbol: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50, // Limit to last 50 trades
      });
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
