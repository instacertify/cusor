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
  const [useGif, setUseGif] = useState(false);

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
      {/* Moving water under the hero wall (MP4 with GIF fallback) */}
      {reduced ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={WATER_STILL}
          alt=""
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-[0.4] saturate-[0.85]"
        />
      ) : useGif ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={WATER_GIF}
          alt=""
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-[0.42] saturate-[0.85] contrast-[0.95] animate-ocean-drift"
        />
      ) : (
        <video
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-[0.42] saturate-[0.85] contrast-[0.95] animate-ocean-drift"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={WATER_STILL}
          onError={() => setUseGif(true)}
        >
          <source src={WATER_MP4} type="video/mp4" />
        </video>
      )}

      {/* Revolving ocean blobs — fill empty right / open space */}
      <div className="absolute inset-0">
        <span className="ocean-blob ocean-blob--a" />
        <span className="ocean-blob ocean-blob--b" />
        <span className="ocean-blob ocean-blob--c" />
      </div>

      {/* Cream hero wall wash — copy stays readable */}
      <div className="absolute inset-0 bg-cream-50/72" />
      <div className="absolute inset-0 bg-gradient-to-r from-cream-50 via-cream-50/86 to-cream-50/38" />
      <div className="absolute inset-0 bg-gradient-to-t from-cream-50 via-cream-50/12 to-cream-50/65" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_40%,transparent_0%,rgb(250_246_238_/0.42)_70%)]" />
    </div>
  );
}
