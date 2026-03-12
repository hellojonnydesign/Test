import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    /*
     * Protect everything except:
     * - /login
     * - /api/auth (NextAuth endpoints)
     * - /_next (static files)
     * - /favicon.ico
     * - /portal (client-facing, public access)
     */
    "/((?!login|api/auth|_next/static|_next/image|favicon\\.ico|portal).*)",
  ],
};
