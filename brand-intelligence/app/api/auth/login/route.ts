import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT id, email, name, role, "agencyId", "passwordHash"
    FROM "User"
    WHERE email = ${email}
  `;
  const user = rows[0];

  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "CredentialsSignin" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash as string);
  if (!valid) {
    return NextResponse.json({ error: "CredentialsSignin" }, { status: 401 });
  }

  const token = await encode({
    token: {
      sub: user.id as string,
      name: user.name as string,
      email: user.email as string,
      role: user.role as string,
      agencyId: user.agencyId as string | null ?? undefined,
    },
    secret: process.env.NEXTAUTH_SECRET!,
  });

  const isSecure = !!process.env.VERCEL || process.env.NEXTAUTH_URL?.startsWith("https://");
  const cookieName = isSecure
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookieName, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
  return response;
}
