import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const handler = NextAuth(authOptions);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  const params = await context.params;
  return handler(request, { params });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  const params = await context.params;

  // Next.js 16 may deliver the request with body already consumed or null.
  // Pre-read and re-inject so next-auth's getBody() can always read it.
  const bodyText = await request.text().catch(() => "");
  const freshReq = new Request(request.url, {
    method: "POST",
    headers: request.headers,
    body: bodyText,
  }) as unknown as NextRequest;

  // next-auth needs req.nextUrl for URL parsing
  Object.defineProperty(freshReq, "nextUrl", { value: request.nextUrl });

  return handler(freshReq, { params });
}
