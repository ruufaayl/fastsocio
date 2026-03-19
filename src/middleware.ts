import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request);

  // Refresh the session - this keeps the auth cookie alive
  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ['/feed', '/discover', '/whiteboard', '/leaderboard', '/chat', '/profile', '/rooms', '/events', '/quests', '/shop', '/settings', '/notifications', '/confessions', '/pro', '/map'];
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Auth pages - redirect to feed if already authenticated
  const authPaths = ['/login', '/register'];
  const isAuthPage = authPaths.some(path => request.nextUrl.pathname === path);

  if (isAuthPage && user) {
    const feedUrl = new URL('/feed', request.url);
    return NextResponse.redirect(feedUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
