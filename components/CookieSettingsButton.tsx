"use client";

export default function CookieSettingsButton({
  className = "inline-flex min-h-8 items-center hover:text-butter-400",
}: {
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        window.dispatchEvent(new Event("certko:open-cookie-prefs"));
      }}
    >
      Cookie settings
    </button>
  );
}
