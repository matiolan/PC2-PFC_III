import clsx from "clsx";
import { BadgeCheck, Fingerprint, Landmark, ShieldCheck, Sprout } from "lucide-react";
import { levelInfo } from "@/lib/domain";

const STYLES = [
  { ring: "ring-ink-200", bg: "bg-ink-50", text: "text-ink-600", icon: Sprout },
  { ring: "ring-sky-200", bg: "bg-sky-50", text: "text-sky-700", icon: Fingerprint },
  { ring: "ring-brand-200", bg: "bg-brand-50", text: "text-brand-700", icon: Landmark },
  { ring: "ring-violet-300", bg: "bg-gradient-to-r from-violet-50 to-brand-50", text: "text-violet-700", icon: BadgeCheck },
  { ring: "ring-saffron-300", bg: "bg-gradient-to-r from-saffron-50 to-amber-50", text: "text-saffron-600", icon: ShieldCheck },
];

/** HU08: insignia pública del nivel de formalización. */
export function LevelBadge({ level, size = "sm", className }: { level: number; size?: "sm" | "md"; className?: string }) {
  const info = levelInfo(level);
  const s = STYLES[info.level];
  const Icon = s.icon;
  return (
    <span
      title={`Nivel ${info.level} de 4: ${info.name}`}
      className={clsx(
        "relative inline-flex items-center gap-1 overflow-hidden rounded-full font-semibold ring-1",
        s.ring,
        s.bg,
        s.text,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        className,
      )}
    >
      {info.level >= 3 && (
        <span
          aria-hidden
          className="animate-shimmer pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgb(255_255_255/0.7)_50%,transparent_70%)] bg-[length:200%_100%]"
        />
      )}
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} aria-hidden />
      <span className="relative">{info.short}</span>
      <span className="sr-only">, nivel {info.level} de 4</span>
    </span>
  );
}
