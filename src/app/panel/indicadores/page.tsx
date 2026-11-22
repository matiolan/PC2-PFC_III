import type { Metadata } from "next";
import { Building2, Clock, Download, FileCheck2, Store, TrendingUp, Users, Wallet } from "lucide-react";
import { Alert, Card, PageHeader } from "@/components/ui";
import { BarList, Ring } from "@/components/charts";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { deriveKpis, formatSoles, LEVELS, type GestorStats } from "@/lib/domain";

export const metadata: Metadata = { title: "Indicadores · Gamarra Conecta" };

const LEVEL_COLORS = ["#8d8a99", "#0284c7", "#5130e0", "#7c3aed", "#e8600a"];

/** HU17: tablero de indicadores de formalización y empleo para el gestor. */
export default async function IndicadoresPage() {
  await requireRole(["gestor"], "/panel/indicadores");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("gestor_stats");
  if (error || !data) return <Alert tone="error">No se pudieron cargar los indicadores.</Alert>;
  const s = data as unknown as GestorStats;
  const k = deriveKpis(s);

  const tiles = [
    { icon: Store, label: "Negocios registrados", value: String(s.total), note: `${s.por_ubicacion.galeria} en galerías · ${s.por_ubicacion.via_publica} en vía pública` },
    { icon: TrendingUp, label: "Con RUC o más (nivel ≥ 2)", value: `${k.tasaFormalizacion}%`, note: `${k.formalizados} negocios formalizados` },
    { icon: Clock, label: "Tiempo promedio de verificación", value: `${s.horas_promedio_revision} h`, note: k.revisionEnPlazo ? "Dentro de la meta de 48 h" : "Por encima de la meta de 48 h" },
    { icon: FileCheck2, label: "Evidencias pendientes", value: String(s.evidencias_pendientes), note: `${k.tasaAprobacion}% de aprobación` },
    { icon: Users, label: "Vacantes abiertas", value: String(s.vacantes), note: `${s.ofertas_abiertas} ofertas · ${s.postulaciones} postulaciones` },
    { icon: Wallet, label: "Sueldo promedio ofertado", value: formatSoles(s.sueldo_promedio), note: `${k.sueldoSobreRmv}% sobre la RMV (${formatSoles(s.rmv)})` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Gestor de galería"
        title="Indicadores de formalización y empleo"
        description="Datos en tiempo real para diseñar y medir programas de formalización con la asociación y la municipalidad."
        actions={
          <a href="/panel/indicadores/exportar" className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-ink-900 ring-1 ring-ink-200 hover:bg-ink-50">
            <Download className="size-4" aria-hidden /> Exportar CSV
          </a>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map(({ icon: Icon, label, value, note }) => (
          <Card key={label} className="flex gap-4 p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs text-ink-500">{label}</p>
              <p className="mt-0.5 text-2xl font-semibold tracking-tight text-ink-900">{value}</p>
              <p className="mt-0.5 text-xs text-ink-500">{note}</p>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card className="p-6">
          <h2 className="font-semibold text-ink-900">Negocios por nivel de formalización</h2>
          <p className="mb-5 text-xs text-ink-500">Ruta: registrado → identificado → con RUC → con licencia → verificado</p>
          <BarList items={LEVELS.map((l) => ({ label: `${l.level} · ${l.name}`, value: s.por_nivel[String(l.level)] ?? 0, color: LEVEL_COLORS[l.level] }))} />
        </Card>
        <Card className="grid grid-cols-2 place-items-center gap-4 p-6">
          <Ring value={k.tasaFormalizacion} label="Formalizados (nivel ≥ 2)" />
          <Ring value={k.tasaAprobacion} label="Evidencias aprobadas" color="#10a88c" />
          <Ring value={s.total ? Math.round((s.por_ubicacion.via_publica / s.total) * 100) : 0} label="Negocios de vía pública" color="#ff7a1a" />
          <Ring value={k.tasaColocacion} label="Postulantes seleccionados" color="#0284c7" />
        </Card>
      </div>
      <Card className="overflow-x-auto p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-ink-900">
          <Building2 className="size-4 text-brand-600" aria-hidden /> Avance por galería
        </h2>
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th scope="col" className="pb-2 font-medium">Ubicación</th>
              <th scope="col" className="pb-2 text-right font-medium">Negocios</th>
              <th scope="col" className="pb-2 text-right font-medium">Con RUC o más</th>
              <th scope="col" className="pb-2 text-right font-medium">Nivel promedio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {s.por_galeria.map((g) => (
              <tr key={g.galeria}>
                <td className="py-2.5 font-medium text-ink-800">{g.galeria}</td>
                <td className="py-2.5 text-right tabular-nums">{g.negocios}</td>
                <td className="py-2.5 text-right tabular-nums">{g.formalizados}</td>
                <td className="py-2.5 text-right tabular-nums">{g.nivel_promedio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
