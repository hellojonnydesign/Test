import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth/options";

export async function GET() {
  const checks: Record<string, unknown> = {};

  checks.env = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "NOT SET",
  };

  // Direct neon query test
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT id, email, name, role, "agencyId", "passwordHash"
      FROM "User"
      WHERE email = ${"jonnyspinder@gmail.com"}
    `;
    const user = rows[0];

    if (!user || !user.passwordHash) {
      checks.neon = { step: "user_lookup", result: "no user or no hash", userFound: !!user };
    } else {
      const valid = await bcrypt.compare("admin123", user.passwordHash as string);
      checks.neon = {
        userFound: true,
        hasHash: true,
        hashPrefix: (user.passwordHash as string).slice(0, 7),
        passwordValid: valid,
        returnedKeys: Object.keys(user),
      };
    }
  } catch (err) {
    checks.neon = { error: String(err) };
  }

  // Call the REAL authorize function (inside provider.options)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const realAuthorize = (authOptions.providers[0] as any).options?.authorize;
    if (!realAuthorize) {
      checks.authorize = { error: "authorize not found in provider.options" };
    } else {
      const result = await realAuthorize(
        { email: "jonnyspinder@gmail.com", password: "admin123" },
        {}
      );
      checks.authorize = {
        returned: result === null ? "null" : result === undefined ? "undefined" : "user_object",
        userId: result?.id ?? null,
      };
    }
  } catch (err) {
    checks.authorize = { threw: true, error: String(err) };
  }

  return NextResponse.json(checks);
}
