import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Redirect root to trading page
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/trading/BTCUSDT", request.url));
  }

  // Redirect /trading to default symbol
  if (request.nextUrl.pathname === "/trading") {
    return NextResponse.redirect(new URL("/trading/BTCUSDT", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
