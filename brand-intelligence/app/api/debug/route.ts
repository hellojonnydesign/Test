import { NextResponse } from "next/server";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

export async function GET() {
  const checks: Record<string, unknown> = {};

  // Check env vars
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

  // Create a fresh Prisma client directly in this route (bypassing prisma.ts singleton)
  try {
    neonConfig.webSocketConstructor = ws;
    const pool = new Pool({ connectionString: dbUrl });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adapter = new PrismaNeon(pool as any);
    const client = new PrismaClient({ adapter });

    const user = await client.user.findUnique({
      where: { email: "jonnyspinder@gmail.com" },
      select: { id: true, email: true, role: true, passwordHash: true },
    });

    await client.$disconnect();

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
