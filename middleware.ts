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
  let isSuperAdmin = false;
  let staffType: string | null = null;

  if (isAuthenticated && userCookie) {
    const userData = safeParseUserCookie(userCookie);

    if (!userData) {
      const response = NextResponse.next();
      response.cookies.delete("auth-token");
      response.cookies.delete("auth-user");
      return response;
    }

    userRole = userData.role || null;
    isSuperAdmin = Boolean(userData.isSuperAdmin);
    staffType = userData.staffType || null;
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
    const dashboardUrl = getDashboardUrl(userRole, isSuperAdmin, staffType);
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // /dashboard should go to role dashboard
  if (pathname === "/dashboard" && isAuthenticated) {
    const dashboardUrl = getDashboardUrl(userRole, isSuperAdmin, staffType);
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Staff default redirect
  if (
    pathname === "/dashboard/staff" &&
    isAuthenticated &&
    userRole === "staff"
  ) {
    return NextResponse.redirect(
      new URL(getStaffDashboardUrl(staffType), request.url)
    );
  }

  if (
    pathname === "/dashboard/admin" &&
    isAuthenticated &&
    userRole === "staff" &&
    staffType === "operator"
  ) {
    return NextResponse.redirect(
      new URL("/dashboard/admin/ecommerce", request.url)
    );
  }

  // Role based access
  if (isProtectedRoute && isAuthenticated) {
    const roleBasedRoutes: Record<string, string> = {
      "/dashboard/admin": "admin",
      "/dashboard/super-admin": "admin",
      "/dashboard/staff": "staff",
      "/dashboard/user": "user",
    };

    const matchedRoute = Object.keys(roleBasedRoutes).find((route) =>
      pathname.startsWith(route)
    );

    if (matchedRoute) {
      const requiredRole = roleBasedRoutes[matchedRoute];

      const canUseAdminDashboard =
        matchedRoute === "/dashboard/admin" &&
        userRole === "staff" &&
        staffType === "operator";

      if (
        (!canUseAdminDashboard && userRole !== requiredRole) ||
        (matchedRoute === "/dashboard/super-admin" && !isSuperAdmin)
      ) {
        const dashboardUrl = getDashboardUrl(userRole, isSuperAdmin, staffType);
        return NextResponse.redirect(new URL(dashboardUrl, request.url));
      }
    }
  }

  if (isProtectedRoute && isAuthenticated && userRole === "staff") {
    const normalizedStaffType = staffType === "operator" ? "operator" : "trainer";

    if (
      normalizedStaffType === "trainer" &&
      [
        "/dashboard/staff/checkins",
        "/dashboard/staff/attendence",
      ].some((route) => pathname.startsWith(route))
    ) {
      return NextResponse.redirect(
        new URL(getStaffDashboardUrl(normalizedStaffType), request.url)
      );
    }

    if (
      normalizedStaffType === "operator" &&
      [
        "/dashboard/staff/workouts",
        "/dashboard/staff/exercises",
        "/dashboard/staff/diet-calendar",
        "/dashboard/staff/training",
        "/dashboard/staff/booking",
      ].some((route) => pathname.startsWith(route))
    ) {
      return NextResponse.redirect(
        new URL(getStaffDashboardUrl(normalizedStaffType), request.url)
      );
    }
  }

  return NextResponse.next();
}

function getStaffDashboardUrl(staffType: string | null = null): string {
  return staffType === "operator"
    ? "/dashboard/admin/ecommerce"
    : "/dashboard/staff/workouts";
}

function getDashboardUrl(
  role: string | null,
  isSuperAdmin = false,
  staffType: string | null = null
): string {
  switch (role) {
    case "admin":
      return isSuperAdmin ? "/dashboard/super-admin" : "/dashboard/admin/ecommerce";
    case "staff":
      return getStaffDashboardUrl(staffType);
    case "user":
      return "/dashboard/user";
    default:
      return "/dashboard/user";
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
