"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export type TestingVideoSlide = {
  id: string;
  label: string;
  href: string;
  videoSrc: string;
  gifSrc?: string;
  posterSrc: string;
};

const DEFAULT_SLIDES: TestingVideoSlide[] = [
  {
    id: "electrical",
    label: "Electronic Testing",
    href: "/testing/electrical-testing",
    videoSrc: "/images/testing/electrical-testing.mp4",
    gifSrc: "/images/testing/electrical-testing.gif",
    posterSrc: "/images/testing/electrical-poster.jpg",
  },
  {
    id: "mechanical",
    label: "Mechanical Testing",
    href: "/testing/mechanical-testing",
    videoSrc: "/images/testing/mechanical-testing.mp4",
    gifSrc: "/images/testing/mechanical-testing.gif",
    posterSrc: "/images/testing/mechanical-poster.jpg",
  },
  {
    id: "lab",
    label: "Lab Testing",
    href: "/testing",
    videoSrc: "/images/hero-lab.mp4",
    gifSrc: "/images/hero-lab.gif",
    posterSrc: "/images/hero-lab-poster.jpg",
  },
];

const HOLD_MS = 7000;

/**
 * Full-bleed homepage background that scrolls between electronic testing,
 * mechanical testing, and general lab footage.
 */
export default function HeroLabBackground({
  slides = DEFAULT_SLIDES,
}: {
  slides?: TestingVideoSlide[];
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"video" | "gif" | "still">("video");
  const [reduced, setReduced] = useState(false);

  const slide = slides[index] ?? slides[0];
  const count = slides.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduced) {
      setMode("still");
      return;
    }
    setMode("video");
  }, [reduced, index]);

  useEffect(() => {
    if (reduced || mode !== "video") return;
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    void el.play().catch(() => setMode("gif"));
    const onError = () => setMode("gif");
    el.addEventListener("error", onError);
    return () => el.removeEventListener("error", onError);
  }, [mode, slide, reduced]);

  // Auto-scroll to the next testing video
  useEffect(() => {
    if (reduced || count <= 1) return;
    const t = window.setTimeout(() => {
      setIndex((i) => (i + 1) % count);
    }, HOLD_MS);
    return () => window.clearTimeout(t);
  }, [index, count, reduced]);

  if (!slide) return null;

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0" aria-hidden>
        {mode === "video" ? (
          <video
            key={slide.videoSrc}
            ref={videoRef}
            className="absolute inset-0 h-full w-full scale-105 object-cover animate-lab-drift transition-opacity duration-700"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={slide.posterSrc}
          >
            <source src={slide.videoSrc} type="video/mp4" />
          </video>
        ) : null}

        {mode === "gif" && slide.gifSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={slide.gifSrc}
            src={slide.gifSrc}
            alt=""
            className="absolute inset-0 h-full w-full scale-105 object-cover animate-lab-drift"
          />
        ) : null}

        {mode === "still" || (mode === "gif" && !slide.gifSrc) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={slide.posterSrc}
            src={slide.posterSrc}
            alt=""
            className="absolute inset-0 h-full w-full scale-105 object-cover"
          />
        ) : null}

        {/* Brand cream wash — keeps Certko navy text readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-cream-50 from-10% via-cream-50/90 via-45% to-cream-50/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-cream-50 via-cream-50/20 to-cream-50/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,transparent_0%,rgb(250_246_238_/0.35)_70%)]" />
      </div>

      {/* Scroll indicators + labels */}
      <div className="pointer-events-auto absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-[1] flex flex-col items-end gap-2">
        <p className="sr-only" aria-live="polite">
          Showing {slide.label}
        </p>
        <Link
          href={slide.href}
          className="rounded-xl bg-ink-950/70 hover:bg-ink-950/85 backdrop-blur px-3.5 py-2 text-xs sm:text-sm font-semibold text-cream-50 transition"
        >
          {slide.label} →
        </Link>
        {count > 1 ? (
          <div className="flex gap-1.5" role="tablist" aria-label="Testing video slides">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={s.label}
                aria-current={i === index ? "true" : undefined}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-butter-500" : "w-2 bg-ink-950/35 hover:bg-ink-950/55"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
