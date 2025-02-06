/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";

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

    // Handle referral bonus for first deposit
    if (type === "deposit" && user.referredBy) {
      const firstDeposit = await prisma.walletTransaction.findFirst({
        where: {
          userId: user.id,
          type: "deposit",
          status: "approved",
        },
      });

      if (!firstDeposit) {
        // This is the first deposit, create referral bonus
        await prisma.referralBonus.create({
          data: {
            userId: user.referredBy,
            fromUserId: user.id,
            amount: amount * 0.1, // 10% bonus
            type: "deposit",
            status: "pending",
          },
        });
      }
    }

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
