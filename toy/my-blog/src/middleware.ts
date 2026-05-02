import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const trulyPublic = [
  "/",
  "/auth",
  "/api",
  "/feed.xml",
  "/sitemap.xml",
  "/robots.txt",
  "/favicon.ico",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /home alone (not /home/blog) is the redirect page, allow it
  if (pathname === "/home" || pathname === "/home/") {
    return NextResponse.next();
  }

  // Allow truly public paths
  if (trulyPublic.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Allow static files
  if (pathname.startsWith("/_next") || /\.(ico|png|svg|jpg|woff2?|js|css)$/.test(pathname)) {
    return NextResponse.next();
  }

  // Protect /home/blog/* and all other routes
  const token = request.cookies.get("nexus_token")?.value;
  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || ""));
    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
