import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/login",
  "/register",
  "/community",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/landing-login",
];

const protectedRoutes = ["/dashboard"];

function isPublicPath(pathname: string) {
  if (pathname === "/") return true;

  return publicRoutes.some((route) => pathname.startsWith(route));
}

function safeParseUserCookie(userCookie: string) {
  try {
    return JSON.parse(decodeURIComponent(userCookie));
  } catch {
    try {
      return JSON.parse(userCookie);
    } catch {
      return null;
    }
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth-token")?.value;
  const userCookie = request.cookies.get("auth-user")?.value;

  const isPublicRoute = isPublicPath(pathname);
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAuthenticated = Boolean(token && userCookie);
  let userRole: string | null = null;

  if (isAuthenticated && userCookie) {
    const userData = safeParseUserCookie(userCookie);

    if (!userData) {
      const response = NextResponse.next();
      response.cookies.delete("auth-token");
      response.cookies.delete("auth-user");
      return response;
    }

    userRole = userData.role || null;
  }

  // Protected route without login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged-in user should not stay on login/register pages
  // But landing-login must stay public because it sets cookies first
  if (
    isPublicRoute &&
    isAuthenticated &&
    pathname !== "/" &&
    pathname !== "/landing-login"
  ) {
    const dashboardUrl = getDashboardUrl(userRole);
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // /dashboard should go to role dashboard
  if (pathname === "/dashboard" && isAuthenticated) {
    const dashboardUrl = getDashboardUrl(userRole);
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Staff default redirect
  if (
    pathname === "/dashboard/staff" &&
    isAuthenticated &&
    userRole === "staff"
  ) {
    return NextResponse.redirect(
      new URL("/dashboard/staff/members", request.url)
    );
  }

  // Role based access
  if (isProtectedRoute && isAuthenticated) {
    const roleBasedRoutes: Record<string, string> = {
      "/dashboard/admin": "admin",
      "/dashboard/staff": "staff",
      "/dashboard/user": "user",
    };

    const matchedRoute = Object.keys(roleBasedRoutes).find((route) =>
      pathname.startsWith(route)
    );

    if (matchedRoute) {
      const requiredRole = roleBasedRoutes[matchedRoute];

      if (userRole !== requiredRole) {
        const dashboardUrl = getDashboardUrl(userRole);
        return NextResponse.redirect(new URL(dashboardUrl, request.url));
      }
    }
  }

  return NextResponse.next();
}

function getDashboardUrl(role: string | null): string {
  switch (role) {
    case "admin":
      return "/dashboard/admin/ecommerce";
    case "staff":
      return "/dashboard/staff/members";
    case "user":
      return "/dashboard/user";
    default:
      return "/dashboard/user";
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};