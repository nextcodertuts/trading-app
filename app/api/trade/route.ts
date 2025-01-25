import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";

const tradeSchema = z.object({
  amount: z.number().positive(),
  direction: z.enum(["up", "down"]),
});

export async function POST(request: NextRequest) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { amount, direction } = tradeSchema.parse(body);

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email as string },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (dbUser.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Simulate trade outcome
    const outcome = Math.random() < 0.5 ? "win" : "loss";
    const profit = outcome === "win" ? amount : -amount;

    // Update user balance and create order
    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        balance: { increment: profit },
        orders: {
          create: {
            amount,
            direction,
            outcome,
          },
        },
      },
    });

    // Use the new Async Request APIs
    return NextResponse.json(
      {
        newBalance: updatedUser.balance,
        outcome,
        profit,
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
    console.error("Error processing trade:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
