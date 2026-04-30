import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/requestAuth";
import { getSafeRedirectPath } from "@/lib/redirects";
import { toggleFollowByUsername } from "@/lib/repositories/socialRepository";

export async function POST(request, { params }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const formData = await request.formData();
  const redirectTo = getSafeRedirectPath(formData.get("redirectTo"));

  await toggleFollowByUsername({
    viewerId: user.id,
    username: params.username,
  });

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
