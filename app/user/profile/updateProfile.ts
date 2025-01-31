"use server";

import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function updateProfile(formData: FormData) {
  const { user } = await validateRequest();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name, email },
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Failed to update profile" };
  }
}
