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

// GET: Fetch transactions with pagination, filtering, and sorting
export async function GET(req: Request) {
  const admin = await isAdmin();
  if (!admin) return;

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const type = url.searchParams.get("type");
  const status = url.searchParams.get("status");
  const skip = (page - 1) * limit;

  const where = {
    ...(type && { type }),
    ...(status && { status }),
  };

  try {
    const [transactions, totalCount] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.walletTransaction.count({ where }),
    ]);

    return NextResponse.json({ transactions, totalCount });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// POST: Create a new transaction
export async function POST(req: Request) {
  const admin = await isAdmin();
  if (!admin) return;

  try {
    const { userId, type, amount, status, reference } = await req.json();
    const newTransaction = await prisma.walletTransaction.create({
      data: { userId, type, amount, status, reference },
    });
    return NextResponse.json({ transaction: newTransaction });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}

// PUT: Update a transaction
export async function PUT(req: Request) {
  const admin = await isAdmin();
  if (!admin) return;

  try {
    const { id, status } = await req.json();
    const updatedTransaction = await prisma.walletTransaction.update({
      where: { id: parseInt(id) },
      data: { status },
    });
    return NextResponse.json({ transaction: updatedTransaction });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}
