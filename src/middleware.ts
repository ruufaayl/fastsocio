import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request);

  // Refresh the session - this keeps the auth cookie alive
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Auth pages — if already logged in, go to feed
  const authPaths = ['/login', '/register'];
  const isAuthPage = authPaths.some(path => pathname === path);

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  // Onboarding — allow if logged in
  if (pathname === '/onboarding' || pathname.startsWith('/onboarding')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return supabaseResponse;
  }

  // Protected routes
  const protectedPaths = ['/feed', '/discover', '/whiteboard', '/leaderboard', '/chat', '/profile', '/rooms', '/events', '/quests', '/shop', '/settings', '/notifications', '/confessions', '/pro', '/map'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
