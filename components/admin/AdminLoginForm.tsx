"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  action?: (formData: FormData) => Promise<void>;
  error?: string;
  locked?: boolean;
  nextPath?: string;
  initialSvg?: string;
  initialToken?: string;
};

const inputClass =
  "w-full rounded-2xl border border-cream-300 bg-white px-4 py-3.5 text-base text-ink-950 outline-none placeholder:text-ink-400 focus:border-butter-500 focus:ring-4 focus:ring-butter-300/40 disabled:opacity-60";

export default function AdminLoginForm({
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
  const submittingRef = useRef(false);

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
    if (!initialSvg || !initialToken) {
      void refreshCaptcha();
    }
  }, [refreshCaptcha, initialSvg, initialToken]);

  return (
    <form
      action="/api/admin/login"
      method="post"
      onSubmit={(e) => {
        // Do not disable named inputs here. React re-renders before the browser
        // serializes the POST, so disabled fields are omitted and the server
        // sees an empty captcha → "Security check answer was wrong".
        if (submittingRef.current) {
          e.preventDefault();
          return;
        }
        submittingRef.current = true;
        setSubmitting(true);
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
          htmlFor="username"
          className="block text-[11px] font-bold uppercase tracking-[0.14em] text-cream-200/80 mb-2"
        >
          Login ID
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          disabled={locked}
          readOnly={submitting}
          autoFocus
          className={inputClass}
          placeholder="e.g. admin"
          defaultValue="admin"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-[11px] font-bold uppercase tracking-[0.14em] text-cream-200/80 mb-2"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            disabled={locked}
            readOnly={submitting}
            className={`${inputClass} pr-24`}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-1.5 text-xs font-semibold text-ink-600 hover:bg-cream-100"
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
          Security check — type the answer
        </label>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="relative flex-1 min-h-[88px] rounded-2xl border border-cream-300 bg-white overflow-hidden flex items-center justify-center">
            {loadingCaptcha ? (
              <span className="text-sm font-semibold text-ink-500 animate-pulse">
                Loading…
              </span>
            ) : svg ? (
              <div
                className="w-full flex items-center justify-center [&_svg]:w-full [&_svg]:h-[88px]"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            ) : (
              <button
                type="button"
                onClick={() => void refreshCaptcha()}
                className="text-sm font-semibold text-red-700 px-3 text-center underline"
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
            New question
          </button>
        </div>
        <input
          id="captcha"
          name="captcha"
          type="text"
          inputMode="numeric"
          required
          autoComplete="off"
          spellCheck={false}
          disabled={locked || !token}
          readOnly={submitting}
          value={captchaValue}
          onChange={(e) => setCaptchaValue(e.target.value.replace(/[^\d+\-−–—]/g, ""))}
          className={`${inputClass} mt-3 tracking-[0.2em]`}
          placeholder="Answer (e.g. 12)"
          maxLength={8}
        />
        <p className="mt-1.5 text-[11px] text-cream-200/55">
          Type the result only (for 7 - 3 type 4). Typing the whole sum also works.
        </p>
      </div>

      <button
        type="submit"
        disabled={locked || !token}
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
