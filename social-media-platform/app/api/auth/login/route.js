import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  if (!user) {
    return NextResponse.redirect(
      new URL("/login?error=Invalid+credentials", request.url),
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.redirect(
      new URL("/login?error=Invalid+credentials", request.url),
    );
  }

  const session = await createSession(user.id);
  const response = NextResponse.redirect(new URL("/feed", request.url));
  response.cookies.set({
    ...sessionCookieOptions(session.expiresAt),
    value: session.token,
  });

  return response;
}
