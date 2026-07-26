"use client";

import { useCallback, useEffect, useState } from "react";

type Props = {
  action: (formData: FormData) => Promise<void>;
  error?: string;
  locked?: boolean;
  nextPath?: string;
  initialSvg?: string;
  initialToken?: string;
};

export default function AdminLoginForm({
  action,
  error,
  locked,
  nextPath = "/admin",
  initialSvg = "",
  initialToken = "",
}: Props) {
  const [svg, setSvg] = useState(initialSvg);
  const [token, setToken] = useState(initialToken);
  const [loadingCaptcha, setLoadingCaptcha] = useState(!initialSvg);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [captchaValue, setCaptchaValue] = useState("");

  const refreshCaptcha = useCallback(async () => {
    setLoadingCaptcha(true);
    setCaptchaValue("");
    try {
      const res = await fetch("/api/admin/captcha", {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error(`captcha failed (${res.status})`);
      const data = (await res.json()) as { svg: string; token?: string };
      if (!data.svg) throw new Error("empty captcha");
      setSvg(data.svg);
      setToken(data.token || "");
    } catch {
      setSvg("");
      setToken("");
    } finally {
      setLoadingCaptcha(false);
    }
  }, []);

  useEffect(() => {
    // Server already rendered a challenge; only fetch if missing
    if (!initialSvg || !initialToken) {
      void refreshCaptcha();
    }
  }, [refreshCaptcha, initialSvg, initialToken]);

  return (
    <form
      action={async (fd) => {
        setSubmitting(true);
        try {
          await action(fd);
        } finally {
          setSubmitting(false);
          // Always refresh captcha after an attempt (success redirects away)
          void refreshCaptcha();
        }
      }}
      className="space-y-5"
    >
      <input type="hidden" name="next" value={nextPath} />
      <input type="hidden" name="captcha_token" value={token} />
      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-300/60 bg-red-500/10 px-4 py-3 text-sm text-red-100"
        >
          {error}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="password"
          className="block text-[11px] font-bold uppercase tracking-[0.14em] text-cream-200/80 mb-2"
        >
          Admin password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            disabled={locked || submitting}
            autoFocus
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3.5 pr-24 text-sm text-cream-50 outline-none placeholder:text-cream-200/40 focus:border-butter-400 focus:ring-4 focus:ring-butter-400/20 disabled:opacity-60"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-1.5 text-xs font-semibold text-cream-200/80 hover:bg-white/10 hover:text-cream-50"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="captcha"
          className="block text-[11px] font-bold uppercase tracking-[0.14em] text-cream-200/80 mb-2"
        >
          Security captcha
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 min-h-[64px] rounded-2xl border border-white/15 bg-[#f7f4ec] overflow-hidden flex items-center justify-center">
            {loadingCaptcha ? (
              <span className="text-xs font-semibold text-ink-500 animate-pulse">
                Loading captcha…
              </span>
            ) : svg ? (
              <div
                className="w-full flex items-center justify-center p-1 [&_svg]:w-full [&_svg]:h-16 [&_svg]:max-h-16"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            ) : (
              <button
                type="button"
                onClick={() => void refreshCaptcha()}
                className="text-xs font-semibold text-red-700 px-3 text-center underline"
              >
                Captcha unavailable — click to retry
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => void refreshCaptcha()}
            disabled={loadingCaptcha || locked || submitting}
            className="shrink-0 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-cream-50 hover:bg-white/10 disabled:opacity-50 transition"
          >
            Refresh
          </button>
        </div>
        <input
          id="captcha"
          name="captcha"
          type="text"
          required
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          disabled={locked || submitting || !token}
          value={captchaValue}
          onChange={(e) => setCaptchaValue(e.target.value.toUpperCase())}
          className="mt-3 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3.5 text-sm text-cream-50 outline-none placeholder:text-cream-200/40 focus:border-butter-400 focus:ring-4 focus:ring-butter-400/20 disabled:opacity-60 tracking-[0.3em] uppercase"
          placeholder="Type the 4 characters"
          maxLength={8}
        />
        <p className="mt-1.5 text-[11px] text-cream-200/45">
          Letters and numbers are not case-sensitive.
        </p>
      </div>

      <button
        type="submit"
        disabled={locked || submitting || !token}
        className="group relative w-full overflow-hidden rounded-2xl bg-butter-400 px-6 py-3.5 text-sm font-bold text-ink-950 transition hover:bg-butter-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="relative z-10">
          {locked ? "Too many attempts — wait 15 min" : submitting ? "Signing in…" : "Sign in to CMS"}
        </span>
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition group-hover:translate-x-full duration-700" />
      </button>
    </form>
  );
}
