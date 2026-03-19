// Middleware disabled — auth protection handled client-side via AuthProvider
// This file is intentionally minimal to avoid session cookie issues

import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
