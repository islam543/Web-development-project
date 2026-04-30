import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, sessionCookieOptions } from "@/lib/auth";

export async function POST(request) {
  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim();
  const username = String(formData.get("username") || "").trim().toLowerCase();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!name || !username || !email || password.length < 8) {
    return NextResponse.redirect(
      new URL("/register?error=Please+provide+valid+inputs", request.url),
    );
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.redirect(
      new URL("/register?error=Email+or+username+already+in+use", request.url),
    );
  }

  const user = await prisma.user.create({
    data: {
      name,
      username,
      email,
      passwordHash: await hashPassword(password),
      bio: "New to Asteria Social.",
    },
    select: { id: true },
  });

  const session = await createSession(user.id);
  const response = NextResponse.redirect(new URL("/feed", request.url));
  response.cookies.set({
    ...sessionCookieOptions(session.expiresAt),
    value: session.token,
  });

  return response;
}
