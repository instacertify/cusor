"use client";

import { useEffect, useState } from "react";

/** Meridian angles around the sphere (degrees). */
const MERIDIANS = [0, 18, 36, 54, 72, 90, 108, 126, 144, 162];

/** Latitude bands: [scale of ring, translateZ as % of radius]. */
const LATITUDES: Array<[number, number]> = [
  [1, 0], // equator
  [0.94, 0.22],
  [0.94, -0.22],
  [0.78, 0.42],
  [0.78, -0.42],
  [0.5, 0.62],
  [0.5, -0.62],
];

/**
 * True spherical wireframe globe — continuous Y-axis rotation,
 * navy/blue site highlight strokes, watermarked on the hero right.
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

      <div className="globe-stage absolute right-[-18%] top-[48%] sm:right-[-10%] lg:right-[-4%] xl:right-[0%]">
        {/* Axial tilt of Earth-like sphere */}
        <div className="globe-axis">
          {/* Continuous spherical spin */}
          <div
            className={`globe-sphere ${reduced ? "" : "animate-globe-spin-y"}`}
          >
            {MERIDIANS.map((angle) => (
              <span
                key={`m-${angle}`}
                className="globe-ring globe-ring--meridian"
                style={{ ["--globe-a" as string]: `${angle}deg` }}
              />
            ))}
            {LATITUDES.map(([scale, z], i) => (
              <span
                key={`lat-${i}`}
                className="globe-ring globe-ring--latitude"
                style={{
                  ["--globe-s" as string]: String(scale),
                  ["--globe-z" as string]: String(z),
                }}
              />
            ))}
            {/* Surface markers that ride the spin */}
            <span className="globe-dot" style={{ ["--globe-a" as string]: "28deg", ["--globe-p" as string]: "18deg" }} />
            <span className="globe-dot" style={{ ["--globe-a" as string]: "110deg", ["--globe-p" as string]: "-8deg" }} />
            <span className="globe-dot" style={{ ["--globe-a" as string]: "200deg", ["--globe-p" as string]: "32deg" }} />
            <span className="globe-dot" style={{ ["--globe-a" as string]: "305deg", ["--globe-p" as string]: "-24deg" }} />
          </div>
          {/* Fixed silhouette rim — sells the sphere edge */}
          <span className="globe-rim" />
        </div>
      </div>

      {/* Cream wall — strong on the left for copy, open on the right for the sphere */}
      <div className="absolute inset-0 bg-gradient-to-r from-cream-50 from-0% via-cream-50/90 via-48% to-cream-50/18" />
      <div className="absolute inset-0 bg-gradient-to-t from-cream-50/90 via-transparent to-cream-50/40" />
    </div>
  );
}
