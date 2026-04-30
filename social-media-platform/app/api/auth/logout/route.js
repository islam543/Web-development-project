import { NextResponse } from "next/server";
import {
  deleteSessionByToken,
  sessionCookieOptions,
} from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/constants";

export async function POST(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  await deleteSessionByToken(token);

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set({
    ...sessionCookieOptions(new Date(0)),
    value: "",
  });

  return response;
}
