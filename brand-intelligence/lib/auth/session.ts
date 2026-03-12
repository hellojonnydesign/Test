import { getToken, decode } from "next-auth/jwt";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// For Route Handlers: pass req to read cookies directly from the request object.
// For Server Components: omit req and cookies() from next/headers is used instead.
export async function requireSession(req?: NextRequest) {
  let token = null;

  if (req) {
    token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
  } else {
    const cookieStore = await cookies();
    const isSecure = !!process.env.VERCEL || process.env.NEXTAUTH_URL?.startsWith("https://");
    const cookieName = isSecure
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";
    const sessionToken = cookieStore.get(cookieName)?.value;
    if (sessionToken) {
      token = await decode({ token: sessionToken, secret: process.env.NEXTAUTH_SECRET! });
    }
  }

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

// For server component layouts
export async function getSessionUser() {
  const cookieStore = await cookies();
  const isSecure = !!process.env.VERCEL || process.env.NEXTAUTH_URL?.startsWith("https://");
  const cookieName = isSecure
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";
  const sessionToken = cookieStore.get(cookieName)?.value;
  if (!sessionToken) return null;
  const token = await decode({ token: sessionToken, secret: process.env.NEXTAUTH_SECRET! });
  if (!token) return null;
  return {
    id: token.sub as string,
    email: token.email as string,
    name: token.name as string,
    role: token.role as string,
    agencyId: (token.agencyId as string) ?? undefined,
  };
}
