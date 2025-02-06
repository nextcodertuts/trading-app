/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const referrals = await prisma.user.findMany({
      where: { referredBy: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    const referralBonuses = await prisma.referralBonus.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      totalReferrals: referrals.length,
      totalEarnings: user.totalReferralEarnings,
      referrals,
      bonuses: referralBonuses,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching referral stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral stats" },
      { status: 500 }
    );
  }
}
