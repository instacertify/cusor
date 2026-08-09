"use client";

import { useEffect, useState } from "react";

/**
 * Moving line-art globe watermark for the hero (PNG + SVG).
 * Soft ink strokes behind the cream wall — never a highlighted card.
 */
export default function GlobeWatermark({
  className = "",
}: {
  className?: string;
}) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0">
        <span className="globe-glow globe-glow--a" />
        <span className="globe-glow globe-glow--b" />
      </div>

      <div
        className={`absolute right-[-8%] top-1/2 w-[min(90vw,560px)] aspect-square -translate-y-1/2 sm:right-[-2%] lg:right-[4%] ${
          reduced ? "" : "animate-globe-float"
        }`}
      >
        {/* Moving line-art globe PNG */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/globe-line-art.png"
          alt=""
          className={`h-full w-full object-contain opacity-[0.42] ${
            reduced ? "" : "animate-globe-spin"
          }`}
        />
      </div>

      {/* Cream hero wall — stronger on the left for copy */}
      <div className="absolute inset-0 bg-gradient-to-r from-cream-50 from-0% via-cream-50/92 via-46% to-cream-50/48" />
      <div className="absolute inset-0 bg-gradient-to-t from-cream-50/95 via-transparent to-cream-50/48" />
    </div>
  );
}
