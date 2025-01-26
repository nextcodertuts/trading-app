import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";

const ITEMS_PER_PAGE = 10;

// Middleware: Ensure admin access
async function isAdmin() {
  const { user } = await validateRequest();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return user;
}

export async function GET(req: Request) {
  const admin = await isAdmin();
  if (!admin) return;

  const url = new URL(req.url);
  const page = Number.parseInt(url.searchParams.get("page") || "1");
  const userId = url.searchParams.get("userId");
  const symbolId = url.searchParams.get("symbolId");
  const direction = url.searchParams.get("direction") as
    | "up"
    | "down"
    | undefined;
  const outcome = url.searchParams.get("outcome") as "win" | "loss" | undefined;

  const where = {
    ...(userId && { userId }),
    ...(symbolId && { symbolId: Number.parseInt(symbolId) }),
    ...(direction && { direction }),
    ...(outcome && { outcome }),
  };

  try {
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true },
          },
          symbol: {
            select: { name: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      totalCount,
      totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
