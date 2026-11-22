"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Loader2, Search, X } from "lucide-react";
import { CATEGORIES } from "@/lib/domain";

/** Filtros de la vitrina: funcionan como formulario GET y se aplican al cambiar. */
export function CatalogFilters({ galleries }: { galleries: { id: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function apply(form: HTMLFormElement) {
    const data = new FormData(form);
    const next = new URLSearchParams();
    for (const [k, v] of data.entries()) if (typeof v === "string" && v.trim()) next.set(k, v.trim());
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  }

  const hasFilters = ["q", "categoria", "galeria", "nivel"].some((k) => params.get(k));

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        apply(e.currentTarget);
      }}
      onChange={(e) => {
        if ((e.target as HTMLElement).tagName === "SELECT") apply(e.currentTarget);
      }}
      className="grid gap-3 rounded-2xl bg-white p-3 ring-1 ring-ink-200/70 shadow-[var(--shadow-soft)] md:grid-cols-[1fr_auto_auto_auto_auto]"
    >
      <label className="relative">
        <span className="sr-only">Buscar productos</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
        <input
          name="q"
          defaultValue={params.get("q") ?? ""}
          placeholder="Busca polos, jeans, uniformes…"
          className="h-11 w-full rounded-xl bg-ink-50 pl-10 pr-3 text-sm ring-1 ring-ink-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </label>
      <select name="categoria" defaultValue={params.get("categoria") ?? ""} aria-label="Categoría" className="h-11 rounded-xl bg-ink-50 px-3 text-sm ring-1 ring-ink-100">
        <option value="">Todas las categorías</option>
        {CATEGORIES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <select name="galeria" defaultValue={params.get("galeria") ?? ""} aria-label="Galería" className="h-11 rounded-xl bg-ink-50 px-3 text-sm ring-1 ring-ink-100">
        <option value="">Todas las ubicaciones</option>
        {galleries.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
        <option value="via-publica">Vía pública</option>
      </select>
      <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-medium text-white hover:bg-brand-700">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Search className="size-4" aria-hidden />} Buscar
      </button>
      {hasFilters && (
        <button
          type="button"
          onClick={() => startTransition(() => router.replace(pathname, { scroll: false }))}
          className="inline-flex h-11 items-center justify-center gap-1 rounded-xl px-3 text-sm text-ink-600 hover:bg-ink-100"
        >
          <X className="size-4" aria-hidden /> Limpiar
        </button>
      )}
    </form>
  );
}
