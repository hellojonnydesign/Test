import { NextResponse } from "next/server";
import { Pool } from "pg";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const checks: Record<string, unknown> = {};

  const dbUrl = process.env.DATABASE_URL ?? "";
  let dbHost = "NOT SET";
  try { dbHost = new URL(dbUrl).hostname; } catch {}
  checks.env = {
    DATABASE_URL: !!dbUrl,
    DATABASE_URL_host: dbHost,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "NOT SET",
  };

  // Test 1: plain pg Pool
  try {
    const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    const result = await pool.query(`SELECT email FROM "User" WHERE email = $1`, ["jonnyspinder@gmail.com"]);
    await pool.end();
    checks.pg = { connected: true, userFound: result.rows.length > 0 };
  } catch (err) {
    checks.pg = { connected: false, error: String(err) };
  }

  // Test 2: PrismaNeonHttp singleton (what auth uses)
  try {
    const user = await prisma.user.findUnique({
      where: { email: "jonnyspinder@gmail.com" },
      select: { email: true, passwordHash: true },
    });
    checks.prisma = {
      connected: true,
      userFound: !!user,
      hasPasswordHash: !!user?.passwordHash,
      passwordHashPrefix: user?.passwordHash?.slice(0, 7) ?? null,
    };
  } catch (err) {
    checks.prisma = { connected: false, error: String(err) };
  }

  return NextResponse.json(checks);
}
