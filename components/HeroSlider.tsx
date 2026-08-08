"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HeroSlide } from "@/lib/db";

function isAnimatedOrExternal(src: string, mediaType: string) {
  return mediaType === "gif" || mediaType === "video" || src.endsWith(".gif") || src.endsWith(".svg");
}

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const activeSlides = useMemo(() => slides.filter((s) => s.media), [slides]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slide = activeSlides[index] ?? null;
  const count = activeSlides.length;

  useEffect(() => {
    if (!slide || count <= 1 || paused) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    if (slide.media_type === "video") {
      const el = videoRef.current;
      if (el) {
        el.currentTime = 0;
        void el.play().catch(() => undefined);
      }
      return;
    }

    timerRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % count);
    }, Math.max(2000, slide.duration_ms || 6000));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [slide, count, paused, index]);

  if (!slide) return null;

  const go = (next: number) => {
    setIndex((next + count) % count);
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl border border-cream-300 shadow-card-hover bg-ink-950 aspect-[4/3] sm:aspect-[5/4] lg:aspect-auto lg:h-[480px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {activeSlides.map((s, i) => {
        const visible = i === index;
        const mediaType = s.media_type || "image";
        return (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              visible ? "opacity-100 z-[1]" : "opacity-0 z-0 pointer-events-none"
            }`}
            aria-hidden={!visible}
          >
            {mediaType === "video" ? (
              <video
                ref={visible ? videoRef : undefined}
                className="h-full w-full object-cover"
                src={s.media}
                poster={s.poster || undefined}
                muted
                playsInline
                autoPlay={visible}
                loop={count === 1}
                onEnded={() => {
                  if (count > 1 && !paused) go(index + 1);
                }}
              />
            ) : isAnimatedOrExternal(s.media, mediaType) ? (
              // Keep GIF animation — next/image can flatten animated GIFs
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.media} alt={s.title || "Hero slide"} className="h-full w-full object-cover" />
            ) : (
              <Image
                src={s.media}
                alt={s.title || "Hero slide"}
                fill
                priority={i === 0}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 620px"
              />
            )}
            {(s.title || s.subtitle || s.link_href) && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/80 via-ink-950/35 to-transparent p-5 sm:p-6 pt-16">
                {s.title ? (
                  <p className="font-display text-lg sm:text-xl font-semibold text-cream-50 leading-snug">
                    {s.title}
                  </p>
                ) : null}
                {s.subtitle ? (
                  <p className="mt-1 text-sm text-cream-100/90 leading-relaxed line-clamp-2">{s.subtitle}</p>
                ) : null}
                {s.link_href ? (
                  <Link
                    href={s.link_href}
                    className="mt-3 inline-flex items-center rounded-xl bg-butter-500 hover:bg-butter-400 text-ink-950 text-sm font-semibold px-4 py-2 transition"
                  >
                    {s.link_label || "Explore more"}
                  </Link>
                ) : null}
              </div>
            )}
          </div>
        );
      })}

      {count > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(index - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-[2] h-10 w-10 rounded-full bg-ink-950/55 hover:bg-ink-950/75 text-cream-50 text-lg font-bold"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(index + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-[2] h-10 w-10 rounded-full bg-ink-950/55 hover:bg-ink-950/75 text-cream-50 text-lg font-bold"
          >
            ›
          </button>
          <div className="absolute top-3 right-3 z-[2] flex gap-1.5">
            {activeSlides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-butter-500" : "w-2 bg-cream-50/55 hover:bg-cream-50/80"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
