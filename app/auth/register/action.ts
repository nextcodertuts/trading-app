/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { z } from "zod";
import { lucia } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { hash } from "@node-rs/argon2";
import crypto from "crypto";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
  })
  .refine((data: any) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export async function register(formData: FormData) {
  const result = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    referralCode: formData.get("referralCode"),
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { name, email, password, referralCode } = result.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Email already registered" };
    }

    let referrer = null;
    if (referralCode) {
      referrer = await prisma.user.findUnique({
        where: { referralCode },
      });
    }

    const hashedPassword = await hash(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        referralCode: crypto.randomUUID(), // Generate a unique referral code
        referredBy: referrer ? referrer.id : null,
      },
    });

    if (referrer) {
      // Create a referral bonus for the referrer
      await prisma.referralBonus.create({
        data: {
          userId: referrer.id,
          amount: 10, // You can adjust this amount as needed
          fromUserId: user.id,
          type: "signup",
          status: "pending",
        },
      });
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "An error occurred during registration" };
  }
}
