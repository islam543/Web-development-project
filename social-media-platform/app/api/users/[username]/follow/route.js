import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/requestAuth";
import { getSafeRedirectPath } from "@/lib/redirects";
import { toggleFollowByUsername } from "@/lib/repositories/socialRepository";

export async function POST(request, { params }) {
  const contentType = request.headers.get("content-type") || "";
  const expectsJson = contentType.includes("application/json");
  const user = await getUserFromRequest(request);

  if (!user) {
    if (expectsJson) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  let redirectTo = "/feed";

  if (!expectsJson) {
    const formData = await request.formData();
    redirectTo = getSafeRedirectPath(formData.get("redirectTo"));
  }

  const result = await toggleFollowByUsername({
    viewerId: user.id,
    username: params.username,
  });

  if (expectsJson) {
    if (result.status === "not_found") {
      return NextResponse.json({ status: "not_found", error: "User not found" }, { status: 404 });
    }

    if (result.status === "self") {
      return NextResponse.json(
        { status: "self", error: "You cannot follow yourself" },
        { status: 400 },
      );
    }

    return NextResponse.json(result);
  }

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
