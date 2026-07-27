import type { ReactNode } from "react";

/* Simple original stroke icon set (24x24 viewBox). */
const PATHS: Record<string, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  flask: (
    <>
      <path d="M10 3v6l-5.5 9.5A1.8 1.8 0 0 0 6 21.5h12a1.8 1.8 0 0 0 1.5-3L14 9V3" />
      <path d="M8.5 3h7M8 15h8" />
    </>
  ),
  handshake: (
    <>
      <path d="M3 7l4-2 5 3 5-3 4 2v7l-4 4-5-3-5 3-4-4z" />
      <path d="M12 8v6" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  phone: (
    <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  ),
  star: (
    <path d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6L12 16.8 6.6 19.7l1.1-6L3.2 9.4l6.1-.8z" />
  ),
  check: <path d="M4 12.5l5 5L20 6.5" />,
  "arrow-right": <path d="M4 12h16m-6-6 6 6-6 6" />,
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9.5C7.5 20 4 17 4 12V6z" />
      <path d="M8.5 12l2.5 2.5 4.5-5" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="9" r="5" />
      <path d="M9 13.5L7.5 21l4.5-2.5L16.5 21 15 13.5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" />
    </>
  ),
  zap: <path d="M13 2L5 13h6l-1 9 9-12h-6z" />,
  cpu: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="10" y="10" width="4" height="4" />
      <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
    </>
  ),
  plug: (
    <>
      <path d="M9 3v5M15 3v5M7 8h10v4a5 5 0 0 1-10 0z" />
      <path d="M12 17v4" />
    </>
  ),
  flame: (
    <path d="M12 3s5 4.5 5 9.5a5 5 0 0 1-10 0c0-2 1-3.6 2-5 .4 1.2 1.2 2 2.3 2.3C11 8 11 5 12 3z" />
  ),
  cup: (
    <>
      <path d="M5 4h11v6a5.5 5.5 0 0 1-11 0z" />
      <path d="M16 6h2.5a2.5 2.5 0 0 1 0 5H16M6 20h9" />
    </>
  ),
  shoe: (
    <>
      <path d="M3 16V9c2 1.5 4 2 6 2l2-2c3 3 7 3 10 5v2z" />
      <path d="M3 16h18M12 11l1.5 1.5M9.5 13l1 1" />
    </>
  ),
  chair: (
    <>
      <path d="M7 3h10v8H7zM6 11h12v4H6z" />
      <path d="M7 15v6M17 15v6" />
    </>
  ),
  glass: (
    <>
      <path d="M7 3h10l-1.5 10a3.5 3.5 0 0 1-7 0z" />
      <path d="M12 16v5M8.5 21h7" />
    </>
  ),
  wrench: (
    <path d="M20 6a5 5 0 0 1-7 5l-7 7a2.1 2.1 0 0 1-3-3l7-7a5 5 0 0 1 6.5-6L13 5.5 15.5 8 19 4.5A5 5 0 0 1 20 6z" />
  ),
  helmet: (
    <>
      <path d="M4 14a8 8 0 0 1 16 0v2H4z" />
      <path d="M2.5 16h19M12 6v-3" />
    </>
  ),
  cylinder: (
    <>
      <rect x="8" y="6" width="8" height="15" rx="3" />
      <path d="M10 6V4h4v2M10 3h4" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2M3 13h18" />
    </>
  ),
  cog: (
    <>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
    </>
  ),
  medical: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  ingot: (
    <>
      <path d="M6 6h12l2 4H4zM4 14h16l2 4H2z" transform="translate(0,-1)" />
    </>
  ),
  box: (
    <>
      <path d="M3 8l9-5 9 5v8l-9 5-9-5z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </>
  ),
  paint: (
    <>
      <rect x="4" y="3" width="14" height="5" rx="1" />
      <path d="M18 5h3v5l-8 2v3" />
      <rect x="11.5" y="15" width="3" height="6" rx="1" />
    </>
  ),
  file: (
    <>
      <path d="M6 2h8l4 4v16H6z" />
      <path d="M14 2v4h4M9 12h6M9 16h6" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19C5 9 12 4 20 4c0 8-5 15-15 15z" />
      <path d="M5 19c3-6 7-9 11-11" />
    </>
  ),
  fuel: (
    <>
      <rect x="4" y="4" width="10" height="17" rx="2" />
      <path d="M6 8h6M14 10h2a2 2 0 0 1 2 2v4a1.5 1.5 0 0 0 3 0V9l-3-3" />
    </>
  ),
  pot: (
    <>
      <path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" />
      <path d="M2 10h20M9 6.5c2-1.5 4 1.5 6 0" />
    </>
  ),
  bottle: (
    <>
      <path d="M10 2h4v4l2 3v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9l2-3z" />
      <path d="M8 13h8" />
    </>
  ),
  droplet: (
    <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />
  ),
  tire: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v5M12 16v5M3 12h5M16 12h5" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 4l1.5 4.5L18 10l-4.5 1.5L12 16l-1.5-4.5L6 10l4.5-1.5z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8zM5 3l.7 1.8L7.5 5.5l-1.8.7L5 8l-.7-1.8L2.5 5.5l1.8-.7z" />
    </>
  ),
  beam: (
    <>
      <path d="M4 5h16M4 19h16M9 5v14M15 5v14" />
    </>
  ),
  spool: (
    <>
      <rect x="7" y="4" width="10" height="16" rx="2" />
      <path d="M7 8h10M7 12h10M7 16h10M17 6l4 2" />
    </>
  ),
  blocks: (
    <>
      <rect x="4" y="12" width="8" height="8" rx="1" />
      <rect x="12" y="12" width="8" height="8" rx="1" />
      <rect x="8" y="4" width="8" height="8" rx="1" />
    </>
  ),
  tree: (
    <>
      <path d="M12 3l5 6h-3l4 5h-4l3 4H7l3-4H6l4-5H7z" />
      <path d="M12 18v3" />
    </>
  ),
  cable: (
    <>
      <path d="M4 6a8 8 0 0 1 16 0 8 8 0 0 1-16 0z" transform="translate(0,6)" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v7M12 15v7" />
    </>
  ),
  car: (
    <>
      <path d="M4 15l1.5-5A2 2 0 0 1 7.4 8.5h9.2a2 2 0 0 1 1.9 1.5L20 15v4h-2.5v-2h-11v2H4z" />
      <circle cx="8" cy="15" r="1" />
      <circle cx="16" cy="15" r="1" />
    </>
  ),
  chart: (
    <>
      <path d="M4 4v16h16" />
      <path d="M8 16v-5M12 16V8M16 16v-3" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3l1 2.5h-2zM12 21l1-2.5h-2zM3 12l2.5 1v-2zM21 12l-2.5 1v-2zM5.6 5.6l2.4 1.1-1.3 1.3zM18.4 18.4L16 17.3l1.3-1.3zM18.4 5.6l-1.1 2.4-1.3-1.3zM5.6 18.4l1.1-2.4 1.3 1.3z" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M3 16l5-4 4 3 3-2 6 4" />
    </>
  ),
  folder: (
    <path d="M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.1 1-1.1 1.8" />
      <circle cx="12" cy="17" r="0.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 5a3.5 3.5 0 0 1 0 6.5M15.5 14.5A6 6 0 0 1 21 20" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 4h16v16H4z" />
      <path d="M4 14h5a3 3 0 0 0 6 0h5" />
    </>
  ),
  logout: (
    <>
      <path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8" />
      <path d="M10 12h11m-4-4 4 4-4 4" />
    </>
  ),
  table: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M3 14h18M12 9v11" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </>
  ),
  flag: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4c4-2 8 2 14 0v9c-6 2-10-2-14 0" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4a3 3 0 0 1 6 0M9 11h6M9 15h6" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5.93" />
      <path d="M14 11a5 5 0 0 0-7.07 0L5.52 12.41a5 5 0 0 0 7.07 7.07L14 18.07" />
    </>
  ),
  chevron: <path d="M6 9l6 6 6-6" />,
  microscope: (
    <>
      <path d="M9 3l4 4-5 5-4-4z" transform="translate(2,0)" />
      <path d="M6 21h13M9 21a7 7 0 0 0 7-7c0-2-1-3.6-2.5-4.6" />
      <path d="M8 17h5" />
    </>
  ),
};

export type IconName = keyof typeof PATHS;

export function hasIcon(name: string): boolean {
  return name in PATHS;
}

export default function Icon({
  name,
  size = 20,
  className = "",
  strokeWidth = 1.8,
}: {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const node = PATHS[name];
  if (!node) {
    // fallback: render raw text (supports legacy emoji values in the CMS)
    return <span className={className} style={{ fontSize: size * 0.9 }}>{name}</span>;
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {node}
    </svg>
  );
}
