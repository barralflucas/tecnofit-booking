import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

const PROTECTED_PREFIXES = ["/admin", "/api/admin"];
const PUBLIC_EXCEPTIONS = ["/admin/login", "/api/admin/auth"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const isPublic = PUBLIC_EXCEPTIONS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  const sessionToken = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  // Compute expected token inline (can't import async helpers easily in edge)
  let expected = "";
  if (process.env.ADMIN_PASSWORD && process.env.ADMIN_SECRET) {
    const encoder = new TextEncoder();
    const data = encoder.encode(
      process.env.ADMIN_PASSWORD + process.env.ADMIN_SECRET
    );
    const hash = await crypto.subtle.digest("SHA-256", data);
    expected = Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const valid = sessionToken && sessionToken === expected;

  if (!valid) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete(ADMIN_SESSION_COOKIE);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
