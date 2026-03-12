import { NextResponse } from "next/server";
import { Pool } from "pg";

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

  // Test with plain pg Pool (same as seed file)
  try {
    const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    const result = await pool.query(
      `SELECT id, email, role, "passwordHash" FROM "User" WHERE email = $1`,
      ["jonnyspinder@gmail.com"]
    );
    await pool.end();
    const user = result.rows[0];
    checks.db = {
      connected: true,
      userFound: !!user,
      userEmail: user?.email ?? null,
      userRole: user?.role ?? null,
      hasPasswordHash: !!user?.passwordHash,
      passwordHashPrefix: user?.passwordHash?.slice(0, 7) ?? null,
    };
  } catch (err) {
    checks.db = { connected: false, error: String(err) };
  }

  return NextResponse.json(checks);
}
