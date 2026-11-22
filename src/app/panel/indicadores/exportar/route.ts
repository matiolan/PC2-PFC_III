import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/csv";
import { deriveKpis, LEVELS, type GestorStats } from "@/lib/domain";

/** HU19: exporta los indicadores y el padrón de negocios en CSV (solo gestores). */
export async function GET() {
  const session = await getSession();
  if (!session || session.profile.role !== "gestor") return new NextResponse("No autorizado", { status: 403 });

  const supabase = await createClient();
  const [{ data: stats }, { data: businesses }] = await Promise.all([
    supabase.rpc("gestor_stats"),
    supabase
      .from("businesses")
      .select("name, category, location_type, zone, stand, level, created_at, galleries(name)")
      .order("level", { ascending: false }),
  ]);
  if (!stats) return new NextResponse("Sin datos", { status: 500 });
  const s = stats as unknown as GestorStats;
  const k = deriveKpis(s);
  const today = new Date().toLocaleDateString("es-PE", { timeZone: "America/Lima" });

  const rows: unknown[][] = [
    ["Gamarra Conecta · Indicadores de formalización y empleo", `Generado el ${today}`],
    [],
    ["Indicador", "Valor"],
    ["Negocios registrados", s.total],
    ["Negocios en galerías", s.por_ubicacion.galeria],
    ["Negocios en vía pública", s.por_ubicacion.via_publica],
    ["Negocios con RUC o más (nivel >= 2)", k.formalizados],
    ["Tasa de formalización (%)", k.tasaFormalizacion],
    ["Evidencias pendientes", s.evidencias_pendientes],
    ["Evidencias aprobadas", s.evidencias_aprobadas],
    ["Evidencias observadas", s.evidencias_observadas],
    ["Horas promedio de verificación", s.horas_promedio_revision],
    ["Ofertas de empleo abiertas", s.ofertas_abiertas],
    ["Vacantes", s.vacantes],
    ["Postulaciones", s.postulaciones],
    ["Postulantes seleccionados", s.seleccionados],
    ["Sueldo promedio ofertado (S/)", s.sueldo_promedio],
    ["RMV vigente (S/)", s.rmv],
    [],
    ["Nivel", "Negocios"],
    ...LEVELS.map((l) => [`${l.level} · ${l.name}`, s.por_nivel[String(l.level)] ?? 0]),
    [],
    ["Ubicación", "Negocios", "Con RUC o más", "Nivel promedio"],
    ...s.por_galeria.map((g) => [g.galeria, g.negocios, g.formalizados, g.nivel_promedio]),
    [],
    ["Negocio", "Rubro", "Ubicación", "Nivel", "Estado", "Registrado"],
    ...(businesses ?? []).map((b) => [
      b.name,
      b.category,
      b.location_type === "galeria" ? `${b.galleries?.name ?? ""} stand ${b.stand ?? ""}` : `Vía pública: ${b.zone ?? ""}`,
      b.level,
      LEVELS[b.level]?.name ?? "",
      new Date(b.created_at).toLocaleDateString("es-PE", { timeZone: "America/Lima" }),
    ]),
  ];

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="indicadores-gamarra-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
