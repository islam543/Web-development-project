import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/requestAuth";
import { toggleLike } from "@/lib/repositories/socialRepository";

export async function POST(request, { params }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const formData = await request.formData();
  const redirectTo = String(formData.get("redirectTo") || "/feed");

  await toggleLike({
    postId: params.postId,
    userId: user.id,
  });

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
