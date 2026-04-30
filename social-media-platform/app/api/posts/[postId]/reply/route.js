import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/requestAuth";
import { addReply } from "@/lib/repositories/socialRepository";

export async function POST(request, { params }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const formData = await request.formData();
  const content = String(formData.get("content") || "").trim();
  const redirectTo = String(
    formData.get("redirectTo") || `/post/${params.postId}`,
  );

  if (!content) {
    return NextResponse.redirect(
      new URL(`${redirectTo}?error=Reply+cannot+be+empty`, request.url),
    );
  }

  await addReply({
    postId: params.postId,
    authorId: user.id,
    content,
  });

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
