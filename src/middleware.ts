import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Keep the markets home at `/` reachable.
 * Auth gating is handled client-side (session + Sign In CTA).
 * Previous boilerplate redirected `/` → `/sign-in` and broke post-login navigation.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
