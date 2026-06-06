import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register"];
const ADMIN_ROUTES = ["/admin-platform"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Read auth token from cookie (mirrored from localStorage via client)
  const token = request.cookies.get("saas_auth_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Decode token (simplified check)
  try {
    const decoded = JSON.parse(atob(token).split(".saas_jwt_secret_key_2024")[0]);
    const now = Date.now();

    // Token expired
    if (decoded.exp < now) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Admin-only route check
    if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
      if (decoded.role !== "platform_admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Inject role headers
    const response = NextResponse.next();
    response.headers.set("x-user-role", decoded.role);
    response.headers.set("x-company-id", decoded.companyId);
    response.headers.set("x-user-id", decoded.userId);

    return response;
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};