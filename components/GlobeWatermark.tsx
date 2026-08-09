"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Meridian angles around the sphere (degrees). */
const MERIDIANS = [0, 18, 36, 54, 72, 90, 108, 126, 144, 162];

/** Latitude bands: [scale of ring, translateZ as % of radius]. */
const LATITUDES: Array<[number, number]> = [
  [1, 0],
  [0.94, 0.22],
  [0.94, -0.22],
  [0.78, 0.42],
  [0.78, -0.42],
  [0.5, 0.62],
  [0.5, -0.62],
];

/** Tiny line-art glyphs for consumer products on the globe. */
const ITEM_PATHS: Record<string, ReactNode> = {
  table: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M3 14h18M12 9v11" />
    </>
  ),
  chair: (
    <>
      <path d="M7 3h10v8H7zM6 11h12v4H6z" />
      <path d="M7 15v6M17 15v6" />
    </>
  ),
  electronics: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="10" y="10" width="4" height="4" />
      <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
    </>
  ),
  toys: (
    <>
      <rect x="4" y="12" width="8" height="8" rx="1" />
      <rect x="12" y="12" width="8" height="8" rx="1" />
      <rect x="8" y="4" width="8" height="8" rx="1" />
    </>
  ),
  fridge: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <path d="M6 10h12M15 5v2M15 14v3" />
    </>
  ),
  "tube-light": (
    <>
      <rect x="3" y="9" width="18" height="6" rx="3" />
      <path d="M6 9V7M12 9V6M18 9V7" />
    </>
  ),
  ac: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M5 12h14M5 15h8" />
    </>
  ),
  fan: (
    <>
      <circle cx="12" cy="12" r="2.2" />
      <path d="M12 4c3 2 4 4 4 6-2 0-3.5-.5-4-2-.5 1.5-2 2-4 2 0-2 1-4 4-6zM20 12c-2 3-4 4-6 4 0-2 .5-3.5 2-4-1.5-.5-2-2-2-4 2 0 4 1 6 4zM12 20c-3-2-4-4-4-6 2 0 3.5.5 4 2 .5-1.5 2-2 4-2 0 2-1 4-4 6zM4 12c2-3 4-4 6-4 0 2-.5 3.5-2 4 1.5.5 2 2 2 4-2 0-4-1-6-4z" />
    </>
  ),
  cement: (
    <>
      <path d="M5 8h14l-1.5 12H6.5z" />
      <path d="M8 8V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V8M8 13h8" />
    </>
  ),
  cube: (
    <>
      <path d="M3 8l9-5 9 5v8l-9 5-9-5z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </>
  ),
  plug: (
    <>
      <path d="M9 3v5M15 3v5M7 8h10v4a5 5 0 0 1-10 0z" />
      <path d="M12 17v4" />
    </>
  ),
  bottle: (
    <>
      <path d="M10 2h4v4l2 3v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9l2-3z" />
      <path d="M8 13h8" />
    </>
  ),
  phone: (
    <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  ),
  shoe: (
    <>
      <path d="M3 16V9c2 1.5 4 2 6 2l2-2c3 3 7 3 10 5v2z" />
      <path d="M3 16h18" />
    </>
  ),
  glass: (
    <>
      <path d="M7 3h10l-1.5 10a3.5 3.5 0 0 1-7 0z" />
      <path d="M12 16v5M8.5 21h7" />
    </>
  ),
  paint: (
    <>
      <rect x="4" y="3" width="14" height="5" rx="1" />
      <path d="M18 5h3v5l-8 2v3" />
      <rect x="11.5" y="15" width="3" height="6" rx="1" />
    </>
  ),
};

type GlobeItem = {
  id: keyof typeof ITEM_PATHS;
  /** Longitude around Y (deg) */
  yaw: number;
  /** Latitude pitch (deg) */
  pitch: number;
};

/** Consumer products distributed around the sphere. */
const GLOBE_ITEMS: GlobeItem[] = [
  { id: "table", yaw: 12, pitch: 18 },
  { id: "chair", yaw: 38, pitch: -12 },
  { id: "electronics", yaw: 70, pitch: 28 },
  { id: "toys", yaw: 98, pitch: -22 },
  { id: "fridge", yaw: 128, pitch: 10 },
  { id: "tube-light", yaw: 155, pitch: -30 },
  { id: "ac", yaw: 185, pitch: 22 },
  { id: "fan", yaw: 215, pitch: -8 },
  { id: "cement", yaw: 245, pitch: 32 },
  { id: "cube", yaw: 275, pitch: -26 },
  { id: "plug", yaw: 305, pitch: 14 },
  { id: "bottle", yaw: 332, pitch: -16 },
  { id: "phone", yaw: 50, pitch: -36 },
  { id: "shoe", yaw: 165, pitch: 36 },
  { id: "glass", yaw: 230, pitch: -38 },
  { id: "paint", yaw: 290, pitch: 8 },
];

function GlobeProductIcon({ id }: { id: keyof typeof ITEM_PATHS }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="globe-item-svg"
      aria-hidden
    >
      {ITEM_PATHS[id]}
    </svg>
  );
}

/**
 * True spherical wireframe globe — continuous Y-axis rotation,
 * with consumer product line-art riding inside the spin.
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
        <div className="globe-axis">
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

            {/* Consumer line-art items moving with the sphere */}
            {GLOBE_ITEMS.map((item) => (
              <span
                key={item.id}
                className="globe-item"
                style={{
                  ["--globe-a" as string]: `${item.yaw}deg`,
                  ["--globe-p" as string]: `${item.pitch}deg`,
                }}
                title={item.id}
              >
                <GlobeProductIcon id={item.id} />
              </span>
            ))}
          </div>
          <span className="globe-rim" />
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-cream-50 from-0% via-cream-50/85 via-45% to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-cream-50/85 via-transparent to-cream-50/30" />
    </div>
  );
}
