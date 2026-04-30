export function getSafeRedirectPath(value, fallback = "/feed") {
  const redirectTo = String(value || "").trim();

  if (!redirectTo) return fallback;
  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return fallback;
  }

  return redirectTo;
}
