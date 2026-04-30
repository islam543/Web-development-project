import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

const protectedPagePrefixes = ["/feed", "/users", "/post", "/stats"];
const protectedApiPrefixes = ["/api/posts", "/api/users", "/api/stats"];
const authPages = ["/login", "/register"];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  const isProtectedPage = protectedPagePrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isProtectedApi = protectedApiPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthPage = authPages.includes(pathname);

  if (!hasSessionCookie && isProtectedPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!hasSessionCookie && isProtectedApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (hasSessionCookie && isAuthPage) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/feed/:path*",
    "/users/:path*",
    "/post/:path*",
    "/stats/:path*",
    "/login",
    "/register",
    "/api/posts/:path*",
    "/api/users/:path*",
    "/api/stats/:path*",
  ],
};
