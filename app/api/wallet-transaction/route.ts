import { validateRequest } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const transactionSchema = z.object({
  type: z.enum(["deposit", "withdrawal"]),
  amount: z.number().positive(),
});

export async function POST(request: NextRequest) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, amount } = transactionSchema.parse(body);

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email as string },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (type === "withdrawal" && dbUser.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    const transaction = await prisma.walletTransaction.create({
      data: {
        userId: dbUser.id,
        type,
        amount,
        status: "pending",
      },
    });

    return NextResponse.json(
      {
        transaction,
        message: `${type} request submitted for approval`,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error processing wallet transaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
