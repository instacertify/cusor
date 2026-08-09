"use client";

import { useEffect, useState } from "react";

/**
 * Large tilted revolving line-art globe on the hero left.
 * Soft watermark behind the cream wall — never a highlighted card.
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

      {/* Bigger tilted globe — left side, revolving */}
      <div className="globe-stage absolute left-[-18%] top-[46%] sm:left-[-12%] lg:left-[-8%] xl:left-[-4%]">
        <div
          className={`globe-tilt ${reduced ? "globe-tilt--still" : "animate-globe-revolve"}`}
        >
          <svg
            viewBox="0 0 480 480"
            className="globe-svg h-full w-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="globeStroke"
                x1="80"
                y1="70"
                x2="400"
                y2="410"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#1B3354" />
                <stop offset="55%" stopColor="#16263D" />
                <stop offset="100%" stopColor="#0F1C2E" />
              </linearGradient>
            </defs>
            <g
              stroke="url(#globeStroke)"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="240" cy="240" r="178" strokeWidth="1.1" opacity="0.28" />
              <circle cx="240" cy="240" r="168" strokeWidth="2.35" />
              <ellipse cx="240" cy="240" rx="168" ry="46" strokeWidth="1.7" />
              <ellipse
                cx="240"
                cy="186"
                rx="152"
                ry="30"
                strokeWidth="1.45"
                opacity="0.9"
              />
              <ellipse
                cx="240"
                cy="294"
                rx="152"
                ry="30"
                strokeWidth="1.45"
                opacity="0.9"
              />
              <ellipse
                cx="240"
                cy="142"
                rx="112"
                ry="17"
                strokeWidth="1.25"
                opacity="0.75"
              />
              <ellipse
                cx="240"
                cy="338"
                rx="112"
                ry="17"
                strokeWidth="1.25"
                opacity="0.75"
              />
              <g className={reduced ? undefined : "animate-globe-meridian"}>
                <ellipse
                  cx="240"
                  cy="240"
                  rx="34"
                  ry="168"
                  strokeWidth="1.35"
                  opacity="0.8"
                />
                <ellipse cx="240" cy="240" rx="86" ry="168" strokeWidth="1.55" />
                <ellipse cx="240" cy="240" rx="132" ry="168" strokeWidth="1.55" />
                <line
                  x1="240"
                  y1="72"
                  x2="240"
                  y2="408"
                  strokeWidth="1.4"
                  opacity="0.78"
                />
              </g>
              <path
                strokeWidth="1.85"
                d="M152 150c22-28 58-38 92-30 24 6 42 22 58 40 10 12 26 18 40 12 16-6 26-22 20-38-8-24 14-42 40-36 18 4 32 20 34 38 4 22-4 42-18 58-10 12-8 30 4 40 16 14 20 38 8 56-10 16-28 24-46 20-20-4-34 10-40 28-6 20-24 34-44 32-26-4-42-26-36-50 4-14-4-28-16-36-18-14-32-34-28-56 4-20 16-36 32-42z"
              />
              <path
                strokeWidth="1.7"
                d="M118 278c14-10 34-8 46 6 12 12 10 30-2 42-8 8-8 22 2 30 12 12 10 34-6 44-16 12-40 10-54-6-12-12-14-30-4-44 8-12 4-28-6-38-12-14-8-32 6-38 6-2 12-2 18 4z"
              />
              <path
                strokeWidth="1.7"
                d="M308 312c20-8 42-2 56 14 14 14 16 36 6 54-10 16-28 26-46 22-20-4-36-18-38-38-2-16 6-32 16-42 2-2 4-6 6-10z"
              />
              <path
                strokeWidth="1.5"
                opacity="0.85"
                d="M210 214c18-8 38-4 52 10 8 8 8 20-2 28-10 8-12 22-4 32"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* Cream wall — clearer on the right where copy lives */}
      <div className="absolute inset-0 bg-gradient-to-r from-cream-50/55 via-cream-50/78 to-cream-50" />
      <div className="absolute inset-0 bg-gradient-to-t from-cream-50/95 via-transparent to-cream-50/55" />
    </div>
  );
}
