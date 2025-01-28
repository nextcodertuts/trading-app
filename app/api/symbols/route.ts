// app/api/symbols/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";

export async function GET() {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const symbols = await prisma.symbol.findMany({
      where: { enabled: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ symbols });
  } catch (error) {
    console.error("Failed to fetch symbols:", error);
    return NextResponse.json(
      { error: "Failed to fetch symbols" },
      { status: 500 }
    );
  }
}
