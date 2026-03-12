import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";

export async function GET() {
  const checks: Record<string, unknown> = {};

  checks.env = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "NOT SET",
  };

  // Step 1: neon query + bcrypt (same as before, confirmed working)
  let user: Record<string, unknown> | undefined;
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT id, email, name, role, "agencyId", "passwordHash"
      FROM "User"
      WHERE email = ${"jonnyspinder@gmail.com"}
    `;
    user = rows[0] as Record<string, unknown>;
    if (!user || !user.passwordHash) {
      checks.neon = { userFound: false };
    } else {
      const valid = await bcrypt.compare("admin123", user.passwordHash as string);
      checks.neon = { userFound: true, passwordValid: valid };
    }
  } catch (err) {
    checks.neon = { error: String(err) };
  }

  // Step 2: JWT encode (same as /api/auth/login does)
  if (user) {
    try {
      const token = await encode({
        token: {
          sub: user.id as string,
          name: user.name as string,
          email: user.email as string,
          role: user.role as string,
          agencyId: (user.agencyId as string | null) ?? undefined,
        },
        secret: process.env.NEXTAUTH_SECRET!,
      });
      checks.encode = { ok: true, tokenLength: token.length };
    } catch (err) {
      checks.encode = { error: String(err) };
    }
  }

  return NextResponse.json(checks);
}
