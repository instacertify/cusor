"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export type TestingVideoSlide = {
  id: string;
  label: string;
  href: string;
  ctaLabel?: string;
  videoSrc: string;
  gifSrc?: string;
  posterSrc: string;
};

const DEFAULT_SLIDES: TestingVideoSlide[] = [
  {
    id: "electrical",
    label: "Electronic Testing",
    href: "/testing/electrical-testing",
    ctaLabel: "Explore more",
    videoSrc: "/images/testing/electrical-testing.mp4",
    gifSrc: "/images/testing/electrical-testing.gif",
    posterSrc: "/images/testing/electrical-poster.jpg",
  },
  {
    id: "mechanical",
    label: "Mechanical Testing",
    href: "/testing/mechanical-testing",
    ctaLabel: "Explore more",
    videoSrc: "/images/testing/mechanical-testing.mp4",
    gifSrc: "/images/testing/mechanical-testing.gif",
    posterSrc: "/images/testing/mechanical-poster.jpg",
  },
  {
    id: "emc",
    label: "EMC Testing",
    href: "/testing/emc-testing",
    ctaLabel: "Explore more",
    videoSrc: "/images/testing/emc-testing.mp4",
    gifSrc: "/images/testing/emc-testing.gif",
    posterSrc: "/images/testing/emc-poster.jpg",
  },
  {
    id: "chemical",
    label: "Chemical & Quality Testing",
    href: "/testing/chemical-testing",
    ctaLabel: "Explore more",
    videoSrc: "/images/testing/chemical-testing.mp4",
    gifSrc: "/images/testing/chemical-testing.gif",
    posterSrc: "/images/testing/chemical-poster.jpg",
  },
  {
    id: "certification",
    label: "Certification Quality",
    href: "/certifications",
    ctaLabel: "Explore more",
    videoSrc: "/images/testing/certification-quality.mp4",
    gifSrc: "/images/testing/certification-quality.gif",
    posterSrc: "/images/testing/certification-poster.jpg",
  },
];

const HOLD_MS = 7000;

/**
 * Full-bleed homepage background that scrolls between electronic, mechanical,
 * EMC, chemical/quality and certification category footage.
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

  const list = slides.length > 0 ? slides : DEFAULT_SLIDES;
  const slide = list[index] ?? list[0];
  const count = list.length;

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

  useEffect(() => {
    if (reduced || count <= 1) return;
    const t = window.setTimeout(() => {
      setIndex((i) => (i + 1) % count);
    }, HOLD_MS);
    return () => window.clearTimeout(t);
  }, [index, count, reduced]);

  if (!slide) return null;

  const cta = slide.ctaLabel?.trim() || "Explore more";

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

        <div className="absolute inset-0 bg-gradient-to-r from-cream-50 from-10% via-cream-50/90 via-45% to-cream-50/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-cream-50 via-cream-50/20 to-cream-50/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,transparent_0%,rgb(250_246_238_/0.35)_70%)]" />
      </div>

      <div className="pointer-events-auto absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-[1] flex flex-col items-end gap-2">
        <p className="sr-only" aria-live="polite">
          Showing {slide.label}
        </p>
        <div className="rounded-2xl bg-ink-950/70 hover:bg-ink-950/85 backdrop-blur px-3.5 py-2.5 text-cream-50 transition shadow-lg max-w-[240px]">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-wide font-semibold text-cream-100/80">
            {slide.label}
          </p>
          <Link
            href={slide.href}
            className="mt-0.5 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-butter-300 hover:text-butter-200"
          >
            {cta} →
          </Link>
        </div>
        {count > 1 ? (
          <div className="flex gap-1.5" role="tablist" aria-label="Testing video slides">
            {list.map((s, i) => (
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
