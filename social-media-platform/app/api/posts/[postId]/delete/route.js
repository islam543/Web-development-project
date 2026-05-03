import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/requestAuth";
import { getSafeRedirectPath } from "@/lib/redirects";
import { prisma } from "@/lib/prisma";

export async function POST(request, { params }) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const formData = await request.formData();
  const redirectTo = getSafeRedirectPath(formData.get("redirectTo"), "/feed");

  await prisma.post.deleteMany({
    where: { id: params.postId, authorId: user.id },
  });

  return NextResponse.redirect(new URL(redirectTo, request.url));
}