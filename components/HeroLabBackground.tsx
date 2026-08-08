"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Full-bleed moving lab background for the homepage hero.
 * Prefers lightweight MP4; falls back to GIF; respects reduced-motion.
 */
export default function HeroLabBackground({
  videoSrc = "/images/hero-lab.mp4",
  gifSrc = "/images/hero-lab.gif",
  posterSrc = "/images/hero-lab-poster.jpg",
}: {
  videoSrc?: string;
  gifSrc?: string;
  posterSrc?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mode, setMode] = useState<"video" | "gif" | "still">("video");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setMode("still");
      return;
    }
    const el = videoRef.current;
    if (!el) return;
    const play = () => {
      void el.play().catch(() => setMode("gif"));
    };
    play();
    const onError = () => setMode("gif");
    el.addEventListener("error", onError);
    return () => el.removeEventListener("error", onError);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {mode === "video" ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full scale-105 object-cover animate-lab-drift"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={posterSrc}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : null}

      {mode === "gif" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={gifSrc}
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover animate-lab-drift"
        />
      ) : null}

      {mode === "still" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterSrc}
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover"
        />
      ) : null}

      {/* Brand cream wash — keeps Certko navy text readable over lab footage */}
      <div className="absolute inset-0 bg-gradient-to-r from-cream-50 from-10% via-cream-50/90 via-45% to-cream-50/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-cream-50 via-cream-50/20 to-cream-50/50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,transparent_0%,rgb(250_246_238_/0.35)_70%)]" />
    </div>
  );
}
