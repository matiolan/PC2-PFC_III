"use client";

import { motion } from "motion/react";

/** Barras horizontales animadas (accesibles: cada barra tiene su valor en texto). */
export function BarList({ items, max, suffix = "" }: { items: { label: string; value: number; color?: string }[]; max?: number; suffix?: string }) {
  const top = max ?? Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, i) => (
        <li key={item.label} className="grid grid-cols-[minmax(7rem,9rem)_1fr_3rem] items-center gap-3 text-sm">
          <span className="truncate text-ink-600">{item.label}</span>
          <span className="h-3 overflow-hidden rounded-full bg-ink-100" aria-hidden>
            <motion.span
              className="block h-full rounded-full"
              style={{ background: item.color ?? "linear-gradient(90deg,#6544f5,#ff7a1a)" }}
              initial={{ width: 0 }}
              whileInView={{ width: `${(item.value / top) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.08, ease: "easeOut" }}
            />
          </span>
          <span className="text-right font-semibold tabular-nums text-ink-900">
            {item.value}
            {suffix}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Anillo de progreso animado. */
export function Ring({ value, label, color = "#6544f5" }: { value: number; label: string; color?: string }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value, 0), 100);
  return (
    <figure className="flex flex-col items-center gap-2">
      <div className="relative">
      <svg viewBox="0 0 100 100" className="size-28 -rotate-90" role="img" aria-label={`${label}: ${pct}%`}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#ecebf0" strokeWidth="10" />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c - (pct / 100) * c }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <span aria-hidden className="absolute inset-0 grid place-items-center text-xl font-bold tabular-nums text-ink-900">{pct}%</span>
      </div>
      <figcaption className="text-center text-xs text-ink-500">{label}</figcaption>
    </figure>
  );
}
