import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/not-admin", request.url));
  }

  return NextResponse.next();
}
