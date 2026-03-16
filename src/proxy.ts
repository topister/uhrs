import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type AuthRequest = NextRequest & {
  auth: { user?: { role?: string; id?: string } } | null;
};

const PUBLIC_ROUTES = ["/", "/login", "/register", "/hospitals", "/doctors"];
const AUTH_ROUTES = ["/login", "/register"];

export const proxy = auth(function proxy(req) {
  const { nextUrl } = req as AuthRequest;
  const session = (req as AuthRequest).auth;
  const isLoggedIn = !!session?.user;

  const isPublicRoute = PUBLIC_ROUTES.some((r) =>
    nextUrl.pathname.startsWith(r)
  );
  const isAuthRoute = AUTH_ROUTES.some((r) => nextUrl.pathname === r);

  if (isLoggedIn && isAuthRoute) {
    const role = session?.user?.role ?? "PATIENT";
    const redirectMap: Record<string, string> = {
      SUPER_ADMIN: "/admin",
      HOSPITAL_ADMIN: "/hospital-admin",
      DOCTOR: "/doctor",
      PATIENT: "/patient",
    };
    return NextResponse.redirect(
      new URL(redirectMap[role] ?? "/patient", req.url)
    );
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${nextUrl.pathname}`, req.url)
    );
  }

  if (isLoggedIn) {
    const role = session?.user?.role ?? "";
    const path = nextUrl.pathname;

    if (path.startsWith("/admin") && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (
      path.startsWith("/hospital-admin") &&
      !["HOSPITAL_ADMIN", "SUPER_ADMIN"].includes(role)
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (
      path.startsWith("/doctor") &&
      !["DOCTOR", "SUPER_ADMIN"].includes(role)
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (
      path.startsWith("/patient") &&
      !["PATIENT", "SUPER_ADMIN"].includes(role)
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};