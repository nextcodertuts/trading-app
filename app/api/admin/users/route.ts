/* eslint-disable @typescript-eslint/no-unused-vars */
// File: /app/api/admin/users/route.ts
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Middleware: Ensure admin access
async function isAdmin() {
  const { user } = await validateRequest();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return user;
}

// GET: Fetch all users
export async function GET() {
  const admin = await isAdmin();
  if (!admin) return;

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        balance: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PUT: Update user role or balance
export async function PUT(req: Request) {
  const admin = await isAdmin();
  if (!admin) return;

  try {
    const { userId, role, balance } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role && { role }),
        ...(balance !== undefined && { balance }),
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE: Delete user
export async function DELETE(req: Request) {
  const admin = await isAdmin();
  if (!admin) return;

  try {
    const { userId } = await req.json();

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
