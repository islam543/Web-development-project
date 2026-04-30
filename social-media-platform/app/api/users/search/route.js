import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/requestAuth";
import { searchUsers } from "@/lib/repositories/socialRepository";

export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const users = await searchUsers({ query, viewerId: user.id });

  return NextResponse.json({ users });
}
