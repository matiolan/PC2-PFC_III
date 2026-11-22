import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Clock, MapPin, Search, ShieldCheck } from "lucide-react";
import { Card, EmptyState } from "@/components/ui";
import { LevelBadge } from "@/components/level-badge";
import { createClient } from "@/lib/supabase/server";
import { CONTRACT_TYPES, formatSoles, sanitizeSearch } from "@/lib/domain";
import { getRmv } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Empleos formales en Gamarra · Gamarra Conecta",
  description: "Ofertas de empleo con sueldo igual o mayor a la remuneración mínima, horario y contrato claros.",
};

const timeAgo = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return days <= 0 ? "hoy" : days === 1 ? "hace 1 día" : `hace ${days} días`;
};

export default async function EmpleosPage({ searchParams }: PageProps<"/empleos">) {
  const sp = await searchParams;
  const q = sanitizeSearch(typeof sp.q === "string" ? sp.q : "");
  const contrato = typeof sp.contrato === "string" && (CONTRACT_TYPES as readonly string[]).includes(sp.contrato) ? sp.contrato : "";
  const supabase = await createClient();
  let query = supabase
    .from("job_offers")
    .select("id, title, salary, schedule, contract_type, vacancies, created_at, businesses!inner(name, slug, level, location_type, zone, galleries(name))")
    .eq("status", "abierta");
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  if (contrato) query = query.eq("contract_type", contrato);
  const [{ data: offers }, rmv] = await Promise.all([query.order("created_at", { ascending: false }).limit(100), getRmv()]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">Bolsa de empleo formal</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">Trabaja en Gamarra con condiciones claras</h1>
      <p className="mt-2 flex items-center gap-2 text-ink-500">
        <ShieldCheck className="size-4 text-mint-600" aria-hidden /> Todas las ofertas pagan al menos la RMV vigente ({formatSoles(rmv)}).
      </p>

      <form role="search" className="mt-8 grid gap-3 rounded-2xl bg-white p-3 ring-1 ring-ink-200/70 shadow-[var(--shadow-soft)] sm:grid-cols-[1fr_auto_auto]">
        <label className="relative">
          <span className="sr-only">Buscar puesto</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <input name="q" defaultValue={q} placeholder="Costurera, cortador, vendedor…" className="h-11 w-full rounded-xl bg-ink-50 pl-10 pr-3 text-sm ring-1 ring-ink-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </label>
        <select name="contrato" defaultValue={contrato} aria-label="Tipo de contrato" className="h-11 rounded-xl bg-ink-50 px-3 text-sm ring-1 ring-ink-100">
          <option value="">Todos los contratos</option>
          {CONTRACT_TYPES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button className="h-11 rounded-xl bg-brand-600 px-5 text-sm font-medium text-white hover:bg-brand-700">Buscar</button>
      </form>

      <p className="mt-6 text-sm text-ink-500" aria-live="polite">{offers?.length ?? 0} oferta(s) abierta(s)</p>
      {!offers?.length ? (
        <div className="mt-4">
          <EmptyState icon={<Briefcase className="size-6" />} title="No hay ofertas con esos filtros" />
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {offers.map((o) => {
            const b = o.businesses;
            return (
              <li key={o.id}>
                <Link href={`/empleos/${o.id}`} className="group block">
                  <Card className="grid gap-4 p-5 transition group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-lift)] sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-ink-900 group-hover:text-brand-700">{o.title}</h2>
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">{o.contract_type}</span>
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-500">
                        <span className="font-medium text-ink-700">{b.name}</span>
                        <LevelBadge level={b.level} />
                        <span className="flex items-center gap-1"><MapPin className="size-3.5" aria-hidden />{b.location_type === "galeria" ? b.galleries?.name : `Vía pública · ${b.zone}`}</span>
                        <span className="flex items-center gap-1"><Clock className="size-3.5" aria-hidden />{o.schedule}</span>
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xl font-semibold text-mint-700">{formatSoles(o.salary)}</p>
                      <p className="text-xs text-ink-400">{o.vacancies} vacante(s) · {timeAgo(o.created_at)}</p>
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
