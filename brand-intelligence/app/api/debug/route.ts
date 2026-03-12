import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const checks: Record<string, unknown> = {};

  const dbUrl = process.env.DATABASE_URL ?? "";
  checks.env = {
    DATABASE_URL: !!dbUrl,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "NOT SET",
  };

  // Simulate exactly what the authorize function does
  try {
    const email = "jonnyspinder@gmail.com";
    const password = "admin123";

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        agencyId: true,
        passwordHash: true,
      },
    });

    if (!user || !user.passwordHash) {
      checks.auth = { step: "user_lookup", result: "no user or no hash", userFound: !!user };
    } else {
      const valid = await bcrypt.compare(password, user.passwordHash);
      checks.auth = {
        step: "bcrypt_compare",
        userFound: true,
        hasHash: true,
        hashPrefix: user.passwordHash.slice(0, 7),
        passwordValid: valid,
        wouldLogin: valid,
      };
    }
  } catch (err) {
    checks.auth = { step: "error", error: String(err) };
  }

  return NextResponse.json(checks);
}
