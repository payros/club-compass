import { betterFetch } from "@better-fetch/fetch";
import { NextResponse } from "next/server";
import { isEmailAllowed } from "@/utils/authUtils";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public paths through without auth check
  const publicPaths = ["/login", "/api/auth", "/img/"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const internalOrigin =
    process.env.NEXTAUTH_URL ?? `http://${request.nextUrl.host}`;
  const { data: session } = await betterFetch("/api/auth/get-session", {
    baseURL: internalOrigin,
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
  });

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Whitelist check: block sessions for non-allowed users
  if (session.user?.email && !isEmailAllowed(session.user.email)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "not_whitelisted");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
