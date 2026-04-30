import { SESSION_COOKIE } from "@/lib/constants";
import { getUserFromSessionToken } from "@/lib/session";

export async function getUserFromRequest(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return getUserFromSessionToken(token);
}
