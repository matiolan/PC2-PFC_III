"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { MapPin } from "lucide-react";
import { LevelBadge } from "@/components/level-badge";
import { dozenSavings, formatSoles } from "@/lib/domain";

export type ProductCardData = {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
  price_unit: number;
  price_dozen: number;
  min_order: number;
  business: { name: string; slug: string; level: number; place: string };
};

export function ProductCard({ p, index = 0 }: { p: ProductCardData; index?: number }) {
  const saving = dozenSavings(p.price_unit, p.price_dozen);
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.04 }}
      whileHover={{ y: -4 }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-ink-200/70 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]"
    >
      <Link href={`/negocios/${p.business.slug}`} className="relative block overflow-hidden" aria-label={`${p.name} de ${p.business.name}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.image_url ?? "/productos/polo.svg"}
          alt=""
          loading="lazy"
          className="aspect-[10/8] w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink-700 backdrop-blur">
          {p.category}
        </span>
        {saving > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-mint-600 px-2.5 py-1 text-[11px] font-semibold text-white">
            −{formatSoles(saving)} x docena
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-2 font-semibold leading-snug text-ink-900">{p.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
            <MapPin className="size-3" aria-hidden /> {p.business.place}
          </p>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <p className="text-lg font-bold tracking-tight text-ink-900">
              {formatSoles(p.price_dozen)} <span className="text-xs font-medium text-ink-500">/ docena</span>
            </p>
            <p className="text-xs text-ink-500">
              {formatSoles(p.price_unit)} c/u · mín. {p.min_order}
            </p>
          </div>
        </div>
        <Link
          href={`/negocios/${p.business.slug}`}
          className="flex items-center justify-between gap-2 rounded-xl bg-ink-50 px-3 py-2 text-sm ring-1 ring-ink-100 transition hover:bg-brand-50 hover:ring-brand-100"
        >
          <span className="truncate font-medium text-ink-800">{p.business.name}</span>
          <LevelBadge level={p.business.level} />
        </Link>
      </div>
    </motion.article>
  );
}
