"use client";

import { useEffect, useRef, useState } from "react";

export type TestingVideoSlide = {
  id: string;
  label: string;
  href: string;
  ctaLabel?: string;
  videoSrc?: string;
  gifSrc?: string;
  /** Static image upload (jpg/png/webp/…) */
  imageSrc?: string;
  posterSrc?: string;
  durationMs?: number;
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
    durationMs: 7000,
  },
  {
    id: "mechanical",
    label: "Mechanical Testing",
    href: "/testing/mechanical-testing",
    ctaLabel: "Explore more",
    videoSrc: "/images/testing/mechanical-testing.mp4",
    gifSrc: "/images/testing/mechanical-testing.gif",
    posterSrc: "/images/testing/mechanical-poster.jpg",
    durationMs: 7000,
  },
  {
    id: "emc",
    label: "EMC Testing",
    href: "/testing/emc-testing",
    ctaLabel: "Explore more",
    videoSrc: "/images/testing/emc-testing.mp4",
    gifSrc: "/images/testing/emc-testing.gif",
    posterSrc: "/images/testing/emc-poster.jpg",
    durationMs: 7000,
  },
  {
    id: "chemical",
    label: "Chemical & Quality Testing",
    href: "/testing/chemical-testing",
    ctaLabel: "Explore more",
    videoSrc: "/images/testing/chemical-testing.mp4",
    gifSrc: "/images/testing/chemical-testing.gif",
    posterSrc: "/images/testing/chemical-poster.jpg",
    durationMs: 7000,
  },
  {
    id: "certification",
    label: "Certification Quality",
    href: "/certifications",
    ctaLabel: "Explore more",
    videoSrc: "/images/testing/certification-quality.mp4",
    gifSrc: "/images/testing/certification-quality.gif",
    posterSrc: "/images/testing/certification-poster.jpg",
    durationMs: 7000,
  },
];

const HOLD_MS = 8000;

function stillSrc(slide: TestingVideoSlide) {
  return slide.posterSrc || slide.imageSrc || slide.gifSrc || "";
}

/**
 * Soft full-bleed hero watermark — media sits behind the hero wall,
 * never as a highlighted card or floating CTA.
 * Pass `slides={[]}` for no media; omit `slides` to use built-in defaults.
 */
export default function HeroLabBackground({
  slides,
  watermark = false,
}: {
  slides?: TestingVideoSlide[];
  /** Extra-soft understated wash behind hero content */
  watermark?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"video" | "gif" | "still">("video");
  const [reduced, setReduced] = useState(false);

  const list = slides ?? DEFAULT_SLIDES;
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
    if (!slide) return;
    if (reduced) {
      setMode("still");
      return;
    }
    if (slide.videoSrc) {
      setMode("video");
      return;
    }
    if (slide.gifSrc) {
      setMode("gif");
      return;
    }
    setMode("still");
  }, [reduced, index, slide]);

  useEffect(() => {
    if (reduced || mode !== "video" || !slide?.videoSrc) return;
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    void el.play().catch(() => setMode(slide.gifSrc ? "gif" : "still"));
    const onError = () => setMode(slide.gifSrc ? "gif" : "still");
    el.addEventListener("error", onError);
    return () => el.removeEventListener("error", onError);
  }, [mode, slide, reduced]);

  useEffect(() => {
    if (reduced || count <= 1 || !slide) return;
    const hold = Math.max(2000, slide.durationMs || HOLD_MS);
    const t = window.setTimeout(() => {
      setIndex((i) => (i + 1) % count);
    }, hold);
    return () => window.clearTimeout(t);
  }, [index, count, reduced, slide]);

  if (!slide || count === 0) return null;

  const mediaTone = watermark
    ? "opacity-35 saturate-[0.55] contrast-[0.95] blur-[0.5px]"
    : "opacity-70";
  const still = stillSrc(slide);

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0">
        {mode === "video" && slide.videoSrc ? (
          <video
            key={slide.videoSrc}
            ref={videoRef}
            className={`absolute inset-0 h-full w-full scale-110 object-cover animate-lab-drift transition-opacity duration-1000 ${mediaTone}`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={slide.posterSrc || undefined}
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
            className={`absolute inset-0 h-full w-full scale-110 object-cover animate-lab-drift ${mediaTone}`}
          />
        ) : null}

        {mode === "still" && still ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={still}
            src={still}
            alt=""
            className={`absolute inset-0 h-full w-full scale-110 object-cover ${mediaTone}`}
          />
        ) : null}

        {/* Hero wall wash — keeps copy readable; media reads as watermark */}
        <div className="absolute inset-0 bg-cream-50/78" />
        <div className="absolute inset-0 bg-gradient-to-r from-cream-50 via-cream-50/88 to-cream-50/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-cream-50 via-transparent to-cream-50/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_45%,transparent_0%,rgb(250_246_238_/0.55)_68%)]" />
      </div>
      <p className="sr-only">Background: {slide.label}</p>
    </div>
  );
}
