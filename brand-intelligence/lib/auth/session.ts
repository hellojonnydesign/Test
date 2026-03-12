import { decode } from "next-auth/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function getTokenFromCookie() {
  const cookieStore = await cookies();
  const isSecure = !!process.env.VERCEL || process.env.NEXTAUTH_URL?.startsWith("https://");
  const cookieName = isSecure
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";
  const sessionToken = cookieStore.get(cookieName)?.value;
  if (!sessionToken) return null;
  return decode({ token: sessionToken, secret: process.env.NEXTAUTH_SECRET! });
}

export async function requireSession() {
  const token = await getTokenFromCookie();
  if (!token) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return {
    session: {
      user: {
        id: token.sub as string,
        email: token.email as string,
        name: token.name as string,
        role: token.role as string,
        agencyId: (token.agencyId as string) ?? undefined,
      },
    },
    error: null,
  };
}

export async function getSessionUser() {
  const token = await getTokenFromCookie();
  if (!token) return null;
  return {
    id: token.sub as string,
    email: token.email as string,
    name: token.name as string,
    role: token.role as string,
    agencyId: (token.agencyId as string) ?? undefined,
  };
}
