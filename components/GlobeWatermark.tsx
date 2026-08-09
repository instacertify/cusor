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

/** Tiny line-art glyphs for consumer / lab products on the globe. */
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
  furniture: (
    <>
      <path d="M4 14h16v3H4zM6 8h12v6H6z" />
      <path d="M7 17v4M17 17v4" />
    </>
  ),
  electronics: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="10" y="10" width="4" height="4" />
      <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
    </>
  ),
  monitor: (
    <>
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
  laptop: (
    <>
      <path d="M4 6h16v10H4z" />
      <path d="M2 16h20v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />
    </>
  ),
  mouse: (
    <>
      <path d="M8 4h8a4 4 0 0 1 4 4v6a6 6 0 0 1-12 0V8a4 4 0 0 1 4-4z" />
      <path d="M12 4v5" />
    </>
  ),
  batteries: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M10 3V1h4v2M7 9h10M7 14h10" />
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
  dishwasher: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <circle cx="12" cy="13" r="4" />
      <path d="M7 6h10" />
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
  "table-fan": (
    <>
      <circle cx="12" cy="10" r="5.5" />
      <circle cx="12" cy="10" r="1.5" />
      <path d="M9 16h6l1 5H8z" />
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
  cup: (
    <>
      <path d="M5 4h11v6a5.5 5.5 0 0 1-11 0z" />
      <path d="M16 6h2.5a2.5 2.5 0 0 1 0 5H16M6 20h9" />
    </>
  ),
  paint: (
    <>
      <rect x="4" y="3" width="14" height="5" rx="1" />
      <path d="M18 5h3v5l-8 2v3" />
      <rect x="11.5" y="15" width="3" height="6" rx="1" />
    </>
  ),
  helmet: (
    <>
      <path d="M4 14a8 8 0 0 1 16 0v2H4z" />
      <path d="M2.5 16h19M12 6v-3" />
    </>
  ),
  purifier: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M10 7h4M9 12h6M10 17h4" />
      <circle cx="12" cy="12" r="1.2" />
    </>
  ),
  induction: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1.5" />
    </>
  ),
  utensils: (
    <>
      <path d="M7 3v8a2 2 0 0 0 2 2v8M7 7h4" />
      <path d="M17 3v18M15 3c0 3 2 4 2 7" />
    </>
  ),
  "food-pack": (
    <>
      <path d="M5 7h14l-1 13H6z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2M8 12h8" />
    </>
  ),
  pen: (
    <>
      <path d="M14 3l7 7-11 11H3v-7z" />
      <path d="M13 5l6 6" />
    </>
  ),
  stamp: (
    <>
      <path d="M8 3h8v6H8z" />
      <path d="M6 12h12v3H6zM4 18h16v3H4z" />
    </>
  ),
  vacuum: (
    <>
      <path d="M6 10a6 6 0 0 1 12 0v5H6z" />
      <path d="M9 15v4h6v-4M12 3v3" />
    </>
  ),
  "vacuum-robot": (
    <>
      <circle cx="12" cy="13" r="7" />
      <circle cx="12" cy="13" r="2.5" />
      <path d="M9 8h6" />
    </>
  ),
  flask: (
    <>
      <path d="M10 3v6l-5.5 9.5A1.8 1.8 0 0 0 6 21.5h12a1.8 1.8 0 0 0 1.5-3L14 9V3" />
      <path d="M8.5 3h7M8 15h8" />
    </>
  ),
  "test-tube": (
    <>
      <path d="M9 3h6v2M10 5v11a2 2 0 0 0 4 0V5" />
      <path d="M10 14h4" />
    </>
  ),
  "lab-glass": (
    <>
      <path d="M6 4h5v4l-3 10h7l-3-10V4h5" />
      <path d="M8 14h8" />
    </>
  ),
  "lab-instrument": (
    <>
      <path d="M9 3l4 4-5 5-4-4z" />
      <path d="M6 21h13M9 21a7 7 0 0 0 7-7c0-2-1-3.6-2.5-4.6" />
      <path d="M8 17h5" />
    </>
  ),
  "mechanical-tool": (
    <path d="M20 6a5 5 0 0 1-7 5l-7 7a2.1 2.1 0 0 1-3-3l7-7a5 5 0 0 1 6.5-6L13 5.5 15.5 8 19 4.5A5 5 0 0 1 20 6z" />
  ),
  gauge: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 13l4-4M8 13h.01M12 9h.01M16 13h.01" />
    </>
  ),
};

type GlobeItem = {
  key: string;
  id: keyof typeof ITEM_PATHS;
  yaw: number;
  pitch: number;
};

/** Dense product field distributed around the sphere. */
const GLOBE_ITEMS: GlobeItem[] = [
  { key: "table", id: "table", yaw: 8, pitch: 16 },
  { key: "chair", id: "chair", yaw: 28, pitch: -14 },
  { key: "furniture", id: "furniture", yaw: 48, pitch: 30 },
  { key: "electronics", id: "electronics", yaw: 66, pitch: -6 },
  { key: "monitor", id: "monitor", yaw: 84, pitch: 22 },
  { key: "laptop", id: "laptop", yaw: 102, pitch: -28 },
  { key: "mouse", id: "mouse", yaw: 118, pitch: 8 },
  { key: "batteries", id: "batteries", yaw: 136, pitch: -18 },
  { key: "toys", id: "toys", yaw: 154, pitch: 34 },
  { key: "fridge", id: "fridge", yaw: 172, pitch: -10 },
  { key: "dishwasher", id: "dishwasher", yaw: 190, pitch: 20 },
  { key: "tube-light", id: "tube-light", yaw: 208, pitch: -32 },
  { key: "ac", id: "ac", yaw: 226, pitch: 12 },
  { key: "fan", id: "fan", yaw: 244, pitch: -20 },
  { key: "table-fan", id: "table-fan", yaw: 262, pitch: 28 },
  { key: "cement", id: "cement", yaw: 280, pitch: -8 },
  { key: "cube", id: "cube", yaw: 298, pitch: 18 },
  { key: "plug", id: "plug", yaw: 316, pitch: -26 },
  { key: "bottle", id: "bottle", yaw: 334, pitch: 10 },
  { key: "phone", id: "phone", yaw: 352, pitch: -16 },
  { key: "shoe", id: "shoe", yaw: 18, pitch: 38 },
  { key: "glass", id: "glass", yaw: 58, pitch: -38 },
  { key: "cup", id: "cup", yaw: 96, pitch: 14 },
  { key: "paint", id: "paint", yaw: 146, pitch: -4 },
  { key: "helmet", id: "helmet", yaw: 178, pitch: 36 },
  { key: "purifier", id: "purifier", yaw: 214, pitch: -36 },
  { key: "induction", id: "induction", yaw: 250, pitch: 6 },
  { key: "utensils", id: "utensils", yaw: 286, pitch: -34 },
  { key: "food-pack", id: "food-pack", yaw: 322, pitch: 32 },
  { key: "pen", id: "pen", yaw: 40, pitch: 4 },
  { key: "stamp", id: "stamp", yaw: 78, pitch: -22 },
  { key: "vacuum", id: "vacuum", yaw: 124, pitch: 26 },
  { key: "vacuum-robot", id: "vacuum-robot", yaw: 168, pitch: -24 },
  { key: "flask", id: "flask", yaw: 204, pitch: 16 },
  { key: "test-tube", id: "test-tube", yaw: 238, pitch: -14 },
  { key: "lab-glass", id: "lab-glass", yaw: 274, pitch: 24 },
  { key: "lab-instrument", id: "lab-instrument", yaw: 308, pitch: -12 },
  { key: "mechanical-tool", id: "mechanical-tool", yaw: 342, pitch: 22 },
  { key: "gauge", id: "gauge", yaw: 14, pitch: -30 },
  // Second ring / offset layer for denser coverage
  { key: "monitor-2", id: "monitor", yaw: 34, pitch: 24 },
  { key: "laptop-2", id: "laptop", yaw: 92, pitch: 8 },
  { key: "batteries-2", id: "batteries", yaw: 152, pitch: 18 },
  { key: "dishwasher-2", id: "dishwasher", yaw: 200, pitch: -18 },
  { key: "purifier-2", id: "purifier", yaw: 256, pitch: -28 },
  { key: "flask-2", id: "flask", yaw: 300, pitch: 4 },
  { key: "utensils-2", id: "utensils", yaw: 348, pitch: -22 },
  { key: "pen-2", id: "pen", yaw: 110, pitch: 36 },
  { key: "vacuum-2", id: "vacuum", yaw: 220, pitch: 34 },
  { key: "test-tube-2", id: "test-tube", yaw: 160, pitch: -40 },
  { key: "gauge-2", id: "gauge", yaw: 270, pitch: 38 },
  { key: "induction-2", id: "induction", yaw: 60, pitch: -8 },
  { key: "food-pack-2", id: "food-pack", yaw: 130, pitch: -32 },
  { key: "helmet-2", id: "helmet", yaw: 310, pitch: -38 },
  { key: "cup-2", id: "cup", yaw: 185, pitch: -2 },
  { key: "stamp-2", id: "stamp", yaw: 25, pitch: -20 },
  // ~10% denser third accents
  { key: "mouse-2", id: "mouse", yaw: 72, pitch: -34 },
  { key: "table-fan-2", id: "table-fan", yaw: 142, pitch: 10 },
  { key: "lab-glass-2", id: "lab-glass", yaw: 188, pitch: -30 },
  { key: "mechanical-2", id: "mechanical-tool", yaw: 232, pitch: 30 },
  { key: "fridge-2", id: "fridge", yaw: 292, pitch: -20 },
  { key: "phone-2", id: "phone", yaw: 8, pitch: 28 },
];

function GlobeProductIcon({ id }: { id: keyof typeof ITEM_PATHS }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
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
 * with a dense field of consumer/lab product line-art riding the spin.
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

            {GLOBE_ITEMS.map((item) => (
              <span
                key={item.key}
                className="globe-item"
                style={{
                  ["--globe-a" as string]: `${item.yaw}deg`,
                  ["--globe-p" as string]: `${item.pitch}deg`,
                }}
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
