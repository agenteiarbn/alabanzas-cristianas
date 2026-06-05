import type { AstroCookies } from "astro";

export function getAccessToken(cookies: AstroCookies): string | null {
  return cookies.get("sb-access-token")?.value ?? null;
}

export function setSession(cookies: AstroCookies, accessToken: string, refreshToken: string) {
  const opts = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" };
  cookies.set("sb-access-token", accessToken, { ...opts, maxAge: 3600 });
  cookies.set("sb-refresh-token", refreshToken, { ...opts, maxAge: 60 * 60 * 24 * 30 });
}

export function clearSession(cookies: AstroCookies) {
  cookies.delete("sb-access-token", { path: "/" });
  cookies.delete("sb-refresh-token", { path: "/" });
}
