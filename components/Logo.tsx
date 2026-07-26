export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M24 3l16.5 6v13.5c0 10.4-7 18.9-16.5 22.5C14.5 41.4 7.5 32.9 7.5 22.5V9L24 3z"
          fill="#16263d"
        />
        <path
          d="M24 6.4l13.4 4.9v11.2c0 8.7-5.7 15.9-13.4 19-7.7-3.1-13.4-10.3-13.4-19V11.3L24 6.4z"
          fill="#1e3352"
        />
        <path
          d="M15.5 24.4l6 6 11-12"
          stroke="#f7c453"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="font-display font-extrabold tracking-tight text-ink-950"
        style={{ fontSize: size * 0.62 }}
      >
        cert<span className="text-butter-600">ko</span>
      </span>
    </span>
  );
}
