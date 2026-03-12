import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const checks: Record<string, unknown> = {};

  // Check env vars (values hidden, just presence)
  const dbUrl = process.env.DATABASE_URL ?? "";
  let dbHost = "NOT SET";
  try { dbHost = new URL(dbUrl).hostname; } catch {}
  checks.env = {
    DATABASE_URL: !!dbUrl,
    DATABASE_URL_host: dbHost,
    DATABASE_URL_has_neon: dbUrl.includes("neon.tech"),
    DATABASE_URL_has_channel_binding: dbUrl.includes("channel_binding"),
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "NOT SET",
  };

  // Check DB connection and user lookup
  try {
    const user = await prisma.user.findUnique({
      where: { email: "jonnyspinder@gmail.com" },
      select: { id: true, email: true, role: true, passwordHash: true },
    });

    checks.db = {
      connected: true,
      userFound: !!user,
      userEmail: user?.email ?? null,
      userRole: user?.role ?? null,
      hasPasswordHash: !!user?.passwordHash,
      passwordHashPrefix: user?.passwordHash?.slice(0, 7) ?? null,
    };
  } catch (err) {
    checks.db = {
      connected: false,
      error: String(err),
    };
  }

  return NextResponse.json(checks);
}
