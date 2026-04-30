import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/requestAuth";
import { getPlatformStats } from "@/lib/repositories/socialRepository";

export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await getPlatformStats();
  return NextResponse.json({ stats });
}
