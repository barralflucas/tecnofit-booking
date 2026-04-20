/**
 * Admin authentication helpers.
 * Session = SHA-256(ADMIN_PASSWORD + ADMIN_SECRET) stored in an HTTP-only cookie.
 * No database session store required — the hash is deterministic.
 */

export const ADMIN_SESSION_COOKIE = "admin_session";

/** Produces the expected session token from the given credentials. */
export async function hashSession(
  password: string,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + secret);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Returns the expected token derived from env vars. */
export async function getExpectedToken(): Promise<string> {
  return hashSession(
    process.env.ADMIN_PASSWORD ?? "",
    process.env.ADMIN_SECRET ?? ""
  );
}

/**
 * Verifies the admin_session cookie on an incoming request.
 * Safe to call from both middleware (Edge) and Route Handlers (Node).
 */
export async function verifyAdminRequest(req: Request): Promise<boolean> {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k.trim(), v.join("=")];
    })
  );
  const token = cookies[ADMIN_SESSION_COOKIE];
  if (!token) return false;
  const expected = await getExpectedToken();
  return token === expected;
}
