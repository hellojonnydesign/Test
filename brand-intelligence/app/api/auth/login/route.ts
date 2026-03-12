import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let step = "parse";
  try {
    const text = await request.text();
    const { email, password } = JSON.parse(text || "{}");

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials", step }, { status: 400 });
    }

    step = "db";
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT id, email, name, role, "agencyId", "passwordHash"
      FROM "User"
      WHERE LOWER(email) = LOWER(${email})
    `;
    const user = rows[0];

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    step = "bcrypt";
    const valid = await bcrypt.compare(password, user.passwordHash as string);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    step = "encode";
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

    step = "cookie";
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
  } catch (err) {
    return NextResponse.json({ error: String(err), step }, { status: 500 });
  }
}
