import Link from "next/link";
import clsx from "clsx";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={clsx("size-9", className)} aria-hidden>
      <defs>
        <linearGradient id="gc-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6544f5" />
          <stop offset="1" stopColor="#ff7a1a" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#gc-logo)" />
      <path
        d="M27.5 13.2a10 10 0 1 0 1.9 9.3H20.5"
        fill="none"
        stroke="#fff"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path d="M8 31.5c6-3 12.5-3 24 0" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.6" strokeDasharray="2.5 2.5" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ dark = false, className }: { dark?: boolean; className?: string }) {
  return (
    <Link href="/" className={clsx("group inline-flex items-center gap-2.5", className)} aria-label="Gamarra Conecta, inicio">
      <LogoMark className="transition-transform duration-300 group-hover:-rotate-6" />
      <span className={clsx("text-[1.05rem] font-semibold tracking-tight", dark ? "text-white" : "text-ink-900")}>
        Gamarra<span className={dark ? "text-saffron-400" : "text-brand-600"}>Conecta</span>
      </span>
    </Link>
  );
}
