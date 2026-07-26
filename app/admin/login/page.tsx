import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import Logo from "@/components/Logo";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import {
  isAdmin,
  setAdminSession,
  checkPassword,
  clearAdminSession,
} from "@/lib/auth";
import { CAPTCHA_COOKIE, verifyCaptchaToken } from "@/lib/captcha";
import {
  clearLoginFailures,
  getClientIp,
  isLoginRateLimited,
  logAdminEvent,
  recordLoginFailure,
} from "@/lib/admin-audit";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

function safeNextPath(raw: string | undefined): string {
  if (!raw || !raw.startsWith("/admin") || raw.startsWith("//") || raw.includes("://")) {
    return "/admin";
  }
  if (raw.startsWith("/admin/login")) return "/admin";
  return raw;
}

async function login(formData: FormData) {
  "use server";
  const hdrs = await headers();
  const ip = getClientIp(hdrs);

  if (isLoginRateLimited(ip)) {
    logAdminEvent("login_blocked", ip, "rate_limited");
    redirect("/admin/login?error=locked");
  }

  const password = String(formData.get("password") ?? "");
  const captcha = String(formData.get("captcha") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? "/admin"));
  const jar = await cookies();
  const captchaToken = jar.get(CAPTCHA_COOKIE)?.value;

  if (!verifyCaptchaToken(captchaToken, captcha)) {
    recordLoginFailure(ip);
    logAdminEvent("login_fail", ip, "bad_captcha");
    jar.delete(CAPTCHA_COOKIE);
    redirect("/admin/login?error=captcha");
  }

  // One-time captcha
  jar.delete(CAPTCHA_COOKIE);

  if (!(await checkPassword(password))) {
    const n = recordLoginFailure(ip);
    logAdminEvent("login_fail", ip, `bad_password attempt=${n}`);
    redirect(n >= 8 ? "/admin/login?error=locked" : "/admin/login?error=1");
  }

  clearLoginFailures(ip);
  await setAdminSession();
  logAdminEvent("login_ok", ip, "session_created");
  redirect(next);
}

interface Props {
  searchParams: Promise<{ error?: string; next?: string }>;
}

const ERRORS: Record<string, string> = {
  "1": "Incorrect password. Check your credentials and try again.",
  captcha: "Captcha did not match. Enter the new characters and try again.",
  locked: "Too many failed attempts. Please wait about 15 minutes, then try again.",
  session: "Your session expired. Sign in again to continue.",
};

export default async function AdminLoginPage({ searchParams }: Props) {
  if (await isAdmin()) redirect("/admin");
  const sp = await searchParams;
  const error = sp.error ? ERRORS[sp.error] || ERRORS["1"] : undefined;
  const locked = sp.error === "locked";
  const next = safeNextPath(sp.next);

  // Ensure stale sessions cannot linger on the login screen
  if (sp.error === "session") {
    await clearAdminSession();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b1220] text-cream-50">
      {/* Atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 15% 20%, rgba(232,176,58,0.22), transparent 55%), radial-gradient(ellipse 70% 50% at 85% 75%, rgba(56,120,180,0.18), transparent 50%), radial-gradient(ellipse 50% 40% at 50% 100%, rgba(232,176,58,0.08), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-butter-400/20 blur-3xl animate-pulse"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-12 sm:px-6 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
        <div className="mb-10 lg:mb-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-butter-300">
            <span className="h-1.5 w-1.5 rounded-full bg-butter-400 animate-pulse" />
            Secure CMS access
          </div>
          <div className="mt-8 max-w-md">
            <Logo width={220} withTagline priority variant="onDark" />
          </div>
          <h1 className="mt-8 font-display text-4xl sm:text-5xl font-semibold tracking-tight text-cream-50 leading-[1.1]">
            Certko
            <span className="block text-butter-300">content control</span>
          </h1>
          <p className="mt-4 max-w-md text-base text-cream-200/75 leading-relaxed">
            Protected admin workspace for certifications, product catalogues, testing
            pages and site content. Sign in with your password and captcha to continue.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-cream-200/70">
            {[
              "Session cookie is httpOnly and signed",
              "Captcha required on every login attempt",
              "Failed attempts are rate-limited and logged",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-butter-400" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-px rounded-[1.75rem] bg-gradient-to-br from-butter-400/40 via-white/10 to-sky-400/20 opacity-80 blur-[1px]"
          />
          <div className="relative rounded-[1.7rem] border border-white/10 bg-[#121a2b]/85 p-7 sm:p-9 shadow-2xl backdrop-blur-xl">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-semibold text-cream-50">Sign in</h2>
              <p className="mt-1 text-sm text-cream-200/65">
                Enter password and captcha to open the CMS.
              </p>
            </div>
            <AdminLoginForm action={login} error={error} locked={locked} nextPath={next} />
            <p className="mt-6 text-center text-[11px] text-cream-200/45">
              Unauthorized access is blocked. All login attempts are audited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
