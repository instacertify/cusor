"use client";

import { useEffect, useState } from "react";

const WATER_GIF = "/images/ocean/water-watermark.gif";
const WATER_MP4 = "/images/ocean/water-loop.mp4";
const WATER_STILL = "/images/ocean/water-still.jpg";

/**
 * Soft moving water watermark + revolving ocean blobs for empty hero space.
 * Decorative only — sits under the cream hero wall, never highlighted.
 */
export default function OceanWatermark({
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
      {/* Moving water GIF watermark under the hero wall */}
      {reduced ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={WATER_STILL}
          alt=""
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 saturate-[0.95]"
        />
      ) : (
        <>
          {/* Prefer light MP4 loop; GIF sits as visual twin / fallback */}
          <video
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-75 saturate-[0.95] animate-ocean-drift"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={WATER_STILL}
          >
            <source src={WATER_MP4} type="video/mp4" />
          </video>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={WATER_GIF}
            alt=""
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-0"
            onError={() => undefined}
          />
        </>
      )}

      {/* Revolving ocean blobs — fill empty right / open space */}
      <div className="absolute inset-0">
        <span className="ocean-blob ocean-blob--a" />
        <span className="ocean-blob ocean-blob--b" />
        <span className="ocean-blob ocean-blob--c" />
      </div>

      {/* Cream hero wall — stronger on the left for copy, lighter on the right for ocean */}
      <div className="absolute inset-0 bg-gradient-to-r from-cream-50 from-0% via-cream-50/88 via-42% to-cream-50/28" />
      <div className="absolute inset-0 bg-gradient-to-t from-cream-50/90 via-transparent to-cream-50/45" />
    </div>
  );
}
