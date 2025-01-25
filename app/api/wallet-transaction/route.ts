/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth"; // Import your auth library

// Deposit or Withdraw Funds
export async function POST(req: Request) {
  const { user, session } = await validateRequest();
  if (!session || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, amount } = await req.json();

  if (!["deposit", "withdrawal"].includes(type)) {
    return NextResponse.json(
      { error: "Invalid transaction type" },
      { status: 400 }
    );
  }

  try {
    const transaction = await prisma.walletTransaction.create({
      data: {
        userId: user.id,
        type,
        amount,
        status: "pending",
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process transaction" },
      { status: 500 }
    );
  }
}

// Get Wallet Transactions for the Authenticated User
export async function GET() {
  const { user, session } = await validateRequest();
  if (!session || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
