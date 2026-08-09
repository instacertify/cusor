"use client";

import { useEffect, useState } from "react";

/**
 * Refined tilted revolving line-art globe on the hero right.
 * Stroke color follows site ink/blue highlight tokens.
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

      {/* Better globe — right side, tilted + revolving */}
      <div className="globe-stage absolute right-[-20%] top-[48%] sm:right-[-12%] lg:right-[-6%] xl:right-[-2%]">
        <div
          className={`globe-tilt ${reduced ? "globe-tilt--still" : "animate-globe-revolve"}`}
        >
          <svg
            viewBox="0 0 480 480"
            className="globe-svg h-full w-full text-[var(--color-ink-950)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Halo ring */}
              <circle cx="240" cy="240" r="186" strokeWidth="1" opacity="0.18" />
              <circle cx="240" cy="240" r="176" strokeWidth="1.15" opacity="0.28" />
              {/* Main sphere */}
              <circle cx="240" cy="240" r="162" strokeWidth="2.6" />

              {/* Latitudes */}
              <ellipse cx="240" cy="240" rx="162" ry="44" strokeWidth="1.7" />
              <ellipse
                cx="240"
                cy="188"
                rx="146"
                ry="28"
                strokeWidth="1.4"
                opacity="0.88"
              />
              <ellipse
                cx="240"
                cy="292"
                rx="146"
                ry="28"
                strokeWidth="1.4"
                opacity="0.88"
              />
              <ellipse
                cx="240"
                cy="146"
                rx="108"
                ry="16"
                strokeWidth="1.2"
                opacity="0.7"
              />
              <ellipse
                cx="240"
                cy="334"
                rx="108"
                ry="16"
                strokeWidth="1.2"
                opacity="0.7"
              />

              {/* Meridians — slow spin */}
              <g className={reduced ? undefined : "animate-globe-meridian"}>
                <ellipse
                  cx="240"
                  cy="240"
                  rx="28"
                  ry="162"
                  strokeWidth="1.25"
                  opacity="0.72"
                />
                <ellipse
                  cx="240"
                  cy="240"
                  rx="78"
                  ry="162"
                  strokeWidth="1.45"
                  opacity="0.9"
                />
                <ellipse cx="240" cy="240" rx="124" ry="162" strokeWidth="1.5" />
                <line
                  x1="240"
                  y1="78"
                  x2="240"
                  y2="402"
                  strokeWidth="1.35"
                  opacity="0.78"
                />
              </g>

              {/* Cleaner continent outlines */}
              <path
                strokeWidth="1.95"
                d="M150 156c24-30 62-40 98-30 26 6 44 24 60 42 10 12 26 18 40 12 18-6 28-24 20-40-8-22 14-40 40-34 18 4 32 20 34 38 4 22-4 42-18 58-10 12-8 28 4 38 16 14 20 38 8 56-10 16-28 24-46 20-20-4-34 10-40 28-6 20-24 34-46 32-26-4-42-26-36-50 4-14-4-28-16-36-18-14-32-34-28-56 4-20 16-36 32-42z"
              />
              <path
                strokeWidth="1.75"
                d="M116 280c16-10 36-8 48 6 12 12 10 30-2 42-8 8-8 22 2 30 12 12 10 34-6 44-16 12-40 10-54-6-12-12-14-30-4-44 8-12 4-28-6-38-12-14-8-32 6-38 6-2 12-2 16 4z"
              />
              <path
                strokeWidth="1.75"
                d="M304 314c22-8 44-2 58 14 14 14 16 36 6 54-10 16-28 26-46 22-20-4-36-18-38-38-2-16 6-32 16-42 2-2 4-6 4-10z"
              />
              {/* Subtle network arcs — certification / global QA feel */}
              <path
                strokeWidth="1.35"
                opacity="0.55"
                d="M168 210c36-18 78-16 112 8"
              />
              <path
                strokeWidth="1.35"
                opacity="0.45"
                d="M196 250c28 18 62 24 96 12"
              />
              <circle cx="168" cy="210" r="3.2" fill="currentColor" stroke="none" opacity="0.55" />
              <circle cx="280" cy="218" r="3.2" fill="currentColor" stroke="none" opacity="0.55" />
              <circle cx="292" cy="262" r="2.8" fill="currentColor" stroke="none" opacity="0.45" />
            </g>
          </svg>
        </div>
      </div>

      {/* Cream wall — clearer on the left where copy lives */}
      <div className="absolute inset-0 bg-gradient-to-r from-cream-50 via-cream-50/88 to-cream-50/42" />
      <div className="absolute inset-0 bg-gradient-to-t from-cream-50/95 via-transparent to-cream-50/50" />
    </div>
  );
}
