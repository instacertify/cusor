/** Only mark cookies Secure when the request is actually HTTPS. */
export function shouldUseSecureCookies(headerStore?: Headers | null): boolean {
  if (process.env.COOKIE_SECURE === "1") return true;
  if (process.env.COOKIE_SECURE === "0") return false;
  const proto = headerStore?.get("x-forwarded-proto") || headerStore?.get("x-forwarded-protocol");
  if (proto) {
    return proto.split(",")[0]?.trim().toLowerCase() === "https";
  }
  // NODE_ENV=production alone is not enough — local/demo often runs http://
  return false;
}
