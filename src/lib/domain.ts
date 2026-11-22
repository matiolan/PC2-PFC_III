/**
 * Reglas y catálogos del dominio de Gamarra Conecta.
 * Se comparten entre la interfaz, las Server Actions y las pruebas.
 */

export const ROLES = ["comprador", "emprendedor", "trabajador", "gestor"] as const;
export type Role = (typeof ROLES)[number];

/** Roles que una persona puede elegir al registrarse (el gestor lo asigna la asociación). */
export const SELF_SERVICE_ROLES = ["comprador", "emprendedor", "trabajador"] as const;
export type SelfServiceRole = (typeof SELF_SERVICE_ROLES)[number];

export const ROLE_INFO: Record<Role, { label: string; description: string }> = {
  comprador: {
    label: "Comprador",
    description: "Busco proveedores mayoristas confiables y quiero cotizar rápido.",
  },
  emprendedor: {
    label: "Emprendedor",
    description: "Tengo un negocio en una galería o en la calle y quiero vender más formalizándome.",
  },
  trabajador: {
    label: "Trabajador",
    description: "Busco empleo con sueldo, horario y contrato claros.",
  },
  gestor: {
    label: "Gestor de galería",
    description: "Verifico la formalización y sigo los indicadores de la asociación.",
  },
};

export const CATEGORIES = [
  "Damas",
  "Caballeros",
  "Niños",
  "Deportivo",
  "Telas e insumos",
  "Accesorios",
  "Uniformes",
  "Ropa de hogar",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CONTRACT_TYPES = ["Plazo indeterminado", "Plazo fijo", "Tiempo parcial", "Prácticas"] as const;
export type ContractType = (typeof CONTRACT_TYPES)[number];

/** RMV por defecto (DS N.° 015-2026-TR). El valor vigente se lee de app_settings. */
export const DEFAULT_RMV = 1230;

export type Level = 0 | 1 | 2 | 3 | 4;

export const LEVELS: {
  level: Level;
  name: string;
  short: string;
  doc: "dni" | "ruc" | "licencia" | "planilla" | null;
  docLabel: string;
  benefit: string;
}[] = [
  {
    level: 0,
    name: "Registrado",
    short: "Registrado",
    doc: null,
    docLabel: "Registro del negocio",
    benefit: "Apareces en la vitrina y en el directorio.",
  },
  {
    level: 1,
    name: "Identificado",
    short: "Con DNI",
    doc: "dni",
    docLabel: "DNI del titular",
    benefit: "Los compradores saben quién está detrás del negocio.",
  },
  {
    level: 2,
    name: "Con RUC",
    short: "Con RUC",
    doc: "ruc",
    docLabel: "Ficha RUC (RUS o RER)",
    benefit: "Puedes emitir comprobantes y vender a empresas.",
  },
  {
    level: 3,
    name: "Con licencia",
    short: "Licencia",
    doc: "licencia",
    docLabel: "Licencia municipal de funcionamiento",
    benefit: "Insignia destacada y mejor posición en la vitrina.",
  },
  {
    level: 4,
    name: "Verificado",
    short: "Verificado",
    doc: "planilla",
    docLabel: "Constancia de trabajadores en planilla (T-Registro)",
    benefit: "Sello de empleador formal y máxima visibilidad.",
  },
];

export function levelInfo(level: number) {
  return LEVELS[Math.min(Math.max(Math.trunc(level), 0), 4)];
}

/** Convierte un texto en un identificador para URL: «Confecciones Ñusta» → «confecciones-nusta». */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const soles = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

export function formatSoles(value: number): string {
  return soles.format(value);
}

export function isValidPeruMobile(phone: string): boolean {
  return /^9\d{8}$/.test(phone);
}

/** Mensaje de cotización prellenado para WhatsApp (HU12). */
export function buildQuoteMessage(input: {
  businessName: string;
  productName?: string;
  quantity?: number;
}): string {
  const base = `Hola ${input.businessName}, los encontré en Gamarra Conecta.`;
  if (!input.productName) return `${base} Quisiera información sobre sus productos al por mayor.`;
  const qty = input.quantity && input.quantity > 0 ? ` ${input.quantity} unidades de` : "";
  return `${base} Quisiera cotizar${qty} «${input.productName}». ¿Cuál es el precio y el tiempo de entrega?`;
}

export function whatsappUrl(phone: string, message: string): string {
  if (!isValidPeruMobile(phone)) throw new Error("Número de WhatsApp inválido");
  return `https://wa.me/51${phone}?text=${encodeURIComponent(message)}`;
}

/** Sueldo mínimo permitido para una oferta según el tipo de contrato (HU14). */
export function minimumSalary(contract: ContractType, rmv: number = DEFAULT_RMV): number {
  return contract === "Tiempo parcial" ? Math.round((rmv / 2) * 100) / 100 : rmv;
}

/** Ahorro por comprar por docena frente a 12 unidades sueltas. */
export function dozenSavings(priceUnit: number, priceDozen: number): number {
  const saving = priceUnit * 12 - priceDozen;
  return saving > 0 ? Math.round(saving * 100) / 100 : 0;
}

/**
 * Orden de la vitrina (HU13): primero mayor nivel de formalización y,
 * a igual nivel, los más recientes.
 */
export function rankByFormalization<T extends { level: number; created_at: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.level - a.level || b.created_at.localeCompare(a.created_at));
}

export function formalizationPercent(level: number): number {
  return Math.round((Math.min(Math.max(level, 0), 4) / 4) * 100);
}

/** Limpia el texto de búsqueda para usarlo en un filtro ilike de PostgREST (sin comodines ni separadores). */
export function sanitizeSearch(q: string | undefined | null): string {
  return (q ?? "")
    .normalize("NFC")
    .replace(/[%_,()*\\:."']/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

export const APPLICATION_STATUS: Record<string, { label: string; tone: "neutral" | "brand" | "success" | "danger" }> = {
  enviada: { label: "Enviada", tone: "neutral" },
  en_revision: { label: "En revisión", tone: "brand" },
  seleccionada: { label: "¡Seleccionado(a)!", tone: "success" },
  descartada: { label: "No seleccionado(a)", tone: "danger" },
};

/** HU18: etiquetas legibles para el registro de auditoría. */
export const AUDIT_ACTIONS: Record<string, string> = {
  negocio_registrado: "Negocio registrado",
  evidencia_subida: "Evidencia enviada",
  evidencia_aprobada: "Evidencia aprobada",
  evidencia_observada: "Evidencia observada",
  nivel_actualizado: "Nivel actualizado",
  oferta_publicada: "Oferta publicada",
  oferta_abierta: "Oferta reabierta",
  oferta_cerrada: "Oferta cerrada",
  postulacion_enviada: "Postulación enviada",
  postulacion_en_revision: "Postulación en revisión",
  postulacion_seleccionada: "Postulante seleccionado",
  postulacion_descartada: "Postulante descartado",
};

export function describeAudit(action: string, details: Record<string, unknown>): string {
  const docs: Record<string, string> = { dni: "DNI", ruc: "RUC", licencia: "licencia municipal", planilla: "planilla" };
  if (action.startsWith("evidencia_")) {
    const base = `${docs[String(details.documento)] ?? "documento"} · nivel ${details.nivel ?? "?"}`;
    return details.nota ? `${base} · «${details.nota}»` : base;
  }
  if (action === "nivel_actualizado") return `${details.nombre ?? ""}: nivel ${details.de} → ${details.a}`;
  if (action === "negocio_registrado") return String(details.nombre ?? "");
  if (action.startsWith("oferta_")) return `${details.titulo ?? ""}${details.sueldo ? ` · S/ ${details.sueldo}` : ""}`;
  return "";
}

export type GestorStats = {
  total: number;
  por_nivel: Record<string, number>;
  por_ubicacion: { galeria: number; via_publica: number };
  por_galeria: { galeria: string; negocios: number; formalizados: number; nivel_promedio: number }[];
  evidencias_pendientes: number;
  evidencias_aprobadas: number;
  evidencias_observadas: number;
  horas_promedio_revision: number;
  ofertas_abiertas: number;
  vacantes: number;
  postulaciones: number;
  seleccionados: number;
  sueldo_promedio: number;
  rmv: number;
};

/** HU17: indicadores derivados para el panel del gestor. */
export function deriveKpis(s: GestorStats) {
  const formalizados = [2, 3, 4].reduce((acc, l) => acc + (s.por_nivel[String(l)] ?? 0), 0);
  const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 1000) / 10 : 0);
  return {
    formalizados,
    tasaFormalizacion: pct(formalizados, s.total),
    tasaAprobacion: pct(s.evidencias_aprobadas, s.evidencias_aprobadas + s.evidencias_observadas),
    sueldoSobreRmv: s.rmv > 0 ? Math.round(((s.sueldo_promedio - s.rmv) / s.rmv) * 1000) / 10 : 0,
    tasaColocacion: pct(s.seleccionados, s.postulaciones),
    revisionEnPlazo: s.horas_promedio_revision <= 48,
  };
}
