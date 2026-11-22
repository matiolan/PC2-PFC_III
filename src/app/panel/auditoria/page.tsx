import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { ScrollText, ShieldCheck } from "lucide-react";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AUDIT_ACTIONS, describeAudit } from "@/lib/domain";

export const metadata: Metadata = { title: "Auditoría · Gamarra Conecta" };

const dateFmt = new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short", timeZone: "America/Lima" });
const FILTERS = [
  { key: "", label: "Todo" },
  { key: "evidencia", label: "Verificaciones" },
  { key: "nivel", label: "Niveles" },
  { key: "negocio", label: "Negocios" },
  { key: "oferta", label: "Empleo" },
];
const PAGE = 30;

/** HU18: registro de auditoría inmutable (solo lo escriben triggers; solo lo lee el gestor). */
export default async function AuditoriaPage({ searchParams }: PageProps<"/panel/auditoria">) {
  await requireRole(["gestor"], "/panel/auditoria");
  const sp = await searchParams;
  const tipo = FILTERS.some((f) => f.key === sp.tipo) ? String(sp.tipo) : "";
  const page = Math.max(1, Number(sp.pagina) || 1);
  const supabase = await createClient();
  let query = supabase
    .from("audit_log")
    .select("id, action, entity, details, created_at, profiles(full_name, role)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE, page * PAGE - 1);
  if (tipo) query = query.like("action", `${tipo}%`);
  const { data, count } = await query;
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Gestor de galería"
        title="Registro de auditoría"
        description="Cada verificación, cambio de nivel y publicación queda registrada con su responsable y fecha. Nadie puede editar ni borrar este registro desde la aplicación."
      />
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key ? `/panel/auditoria?tipo=${f.key}` : "/panel/auditoria"}
            className={clsx(
              "rounded-full px-3 py-1.5 text-sm ring-1 transition",
              tipo === f.key ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-ink-600 ring-ink-200 hover:ring-ink-300",
            )}
          >
            {f.label}
          </Link>
        ))}
        <span className="ml-auto flex items-center gap-1.5 text-xs text-ink-500">
          <ShieldCheck className="size-4 text-mint-600" aria-hidden /> {count ?? 0} evento(s)
        </span>
      </div>
      {!data?.length ? (
        <EmptyState icon={<ScrollText className="size-6" />} title="Sin eventos" />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Fecha</th>
                <th scope="col" className="px-4 py-3 font-medium">Acción</th>
                <th scope="col" className="px-4 py-3 font-medium">Detalle</th>
                <th scope="col" className="px-4 py-3 font-medium">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {data.map((e) => (
                <tr key={e.id} className="hover:bg-ink-50/60">
                  <td className="whitespace-nowrap px-4 py-3 text-ink-500">{dateFmt.format(new Date(e.created_at))}</td>
                  <td className="px-4 py-3 font-medium text-ink-800">{AUDIT_ACTIONS[e.action] ?? e.action}</td>
                  <td className="px-4 py-3 text-ink-600">{describeAudit(e.action, (e.details ?? {}) as Record<string, unknown>)}</td>
                  <td className="px-4 py-3 text-ink-600">{e.profiles?.full_name ?? "Sistema"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {pages > 1 && (
        <nav aria-label="Paginación" className="flex items-center justify-center gap-3 text-sm">
          {page > 1 && <Link className="rounded-lg px-3 py-1.5 ring-1 ring-ink-200 hover:bg-white" href={`/panel/auditoria?${new URLSearchParams({ ...(tipo && { tipo }), pagina: String(page - 1) })}`}>Anterior</Link>}
          <span className="text-ink-500">Página {page} de {pages}</span>
          {page < pages && <Link className="rounded-lg px-3 py-1.5 ring-1 ring-ink-200 hover:bg-white" href={`/panel/auditoria?${new URLSearchParams({ ...(tipo && { tipo }), pagina: String(page + 1) })}`}>Siguiente</Link>}
        </nav>
      )}
    </div>
  );
}
