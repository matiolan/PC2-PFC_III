import { z } from "zod";
import { CATEGORIES, SELF_SERVICE_ROLES } from "@/lib/domain";

/** Resultado estándar de una Server Action para formularios con useActionState. */
export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
  values?: Record<string, string>;
};

export function fieldErrors(error: z.ZodError): FormState["errors"] {
  return z.flattenError(error).fieldErrors as FormState["errors"];
}

/** Convierte FormData en objeto plano de strings (sin archivos). */
export function formValues(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$")) out[key] = value;
  }
  return out;
}

const email = z.string().trim().toLowerCase().max(254).pipe(z.email("Ingresa un correo válido"));

export const passwordSchema = z
  .string()
  .min(8, "Usa al menos 8 caracteres")
  .max(72, "Máximo 72 caracteres")
  .regex(/[A-Za-z]/, "Incluye al menos una letra")
  .regex(/[0-9]/, "Incluye al menos un número");

export const signUpSchema = z.object({
  fullName: z.string().trim().min(3, "Escribe tu nombre completo").max(120),
  email,
  password: passwordSchema,
  role: z.enum(SELF_SERVICE_ROLES, "Elige cómo usarás la plataforma"),
});

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Ingresa tu contraseña").max(72),
});

export const resetRequestSchema = z.object({ email });

export const newPasswordSchema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "Las contraseñas no coinciden", path: ["confirm"] });

/** Solo se permiten rutas internas como destino tras iniciar sesión (evita redirecciones abiertas). */
export function safeNextPath(next: unknown, fallback = "/panel"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .optional()
    .transform((v) => (v ? v : null));

/** HU04: registro del negocio en galería o en la vía pública. */
export const businessSchema = z
  .object({
    name: z.string().trim().min(3, "Escribe el nombre comercial").max(80),
    category: z.enum(CATEGORIES, "Elige un rubro"),
    description: optionalText(500),
    location_type: z.enum(["galeria", "via_publica"], "Indica dónde está tu negocio"),
    gallery_id: z.string().trim().optional().transform((v) => (v ? v : null)),
    floor: optionalText(10),
    stand: optionalText(20),
    zone: optionalText(80),
    whatsapp: z
      .string()
      .trim()
      .transform((v) => v.replace(/\s|-/g, "").replace(/^\+?51/, ""))
      .pipe(z.string().regex(/^9\d{8}$/, "Usa un celular peruano de 9 dígitos que empiece con 9")),
  })
  .superRefine((v, ctx) => {
    if (v.location_type === "galeria") {
      if (!v.gallery_id || !z.uuid().safeParse(v.gallery_id).success)
        ctx.addIssue({ code: "custom", path: ["gallery_id"], message: "Elige tu galería" });
      if (!v.stand) ctx.addIssue({ code: "custom", path: ["stand"], message: "Indica tu stand" });
    } else if (!v.zone) {
      ctx.addIssue({ code: "custom", path: ["zone"], message: "Indica la zona o cuadra donde vendes" });
    }
  })
  .transform((v) =>
    v.location_type === "galeria"
      ? { ...v, zone: null }
      : { ...v, gallery_id: null, floor: null, stand: null },
  );

export const EVIDENCE_MAX_BYTES = 5 * 1024 * 1024;
export const EVIDENCE_TYPES = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png" } as const;

/** HU06: archivo de evidencia permitido (PDF, JPG o PNG de hasta 5 MB). */
export function validateEvidenceFile(file: { type: string; size: number }): string | null {
  if (!(file.type in EVIDENCE_TYPES)) return "Sube un PDF, JPG o PNG.";
  if (file.size === 0) return "El archivo está vacío.";
  if (file.size > EVIDENCE_MAX_BYTES) return "El archivo supera los 5 MB.";
  return null;
}

const DOC_BY_LEVEL = { 1: "dni", 2: "ruc", 3: "licencia", 4: "planilla" } as const;

/** HU06: número del documento según el nivel (DNI, RUC, licencia o constancia de planilla). */
export const evidenceSchema = z
  .object({
    level: z.coerce.number().int().min(1).max(4),
    doc_number: z.string().trim().toUpperCase().min(1, "Ingresa el número del documento").max(30),
    file_path: z.string().trim().min(1).max(300),
  })
  .superRefine((v, ctx) => {
    const doc = DOC_BY_LEVEL[v.level as 1 | 2 | 3 | 4];
    const rules: Record<string, [RegExp, string]> = {
      dni: [/^\d{8}$/, "El DNI tiene 8 dígitos"],
      ruc: [/^(10|20)\d{9}$/, "El RUC tiene 11 dígitos y empieza con 10 o 20"],
      licencia: [/^[A-Z0-9-]{6,30}$/, "Usa el número de licencia (6 a 30 caracteres, letras, números o guiones)"],
      planilla: [/^[A-Z0-9-]{6,30}$/, "Usa el número de constancia (6 a 30 caracteres, letras, números o guiones)"],
    };
    const [re, msg] = rules[doc];
    if (!re.test(v.doc_number)) ctx.addIssue({ code: "custom", path: ["doc_number"], message: msg });
    if (!/^[0-9a-f-]{36}\/[1-4]-[0-9a-f-]{36}\.(pdf|jpg|png)$/.test(v.file_path))
      ctx.addIssue({ code: "custom", path: ["file_path"], message: "Ruta de archivo inválida" });
  })
  .transform((v) => ({ ...v, doc_type: DOC_BY_LEVEL[v.level as 1 | 2 | 3 | 4] }));

/** HU07: decisión del gestor; observar exige indicar el motivo. */
export const reviewSchema = z
  .object({
    id: z.uuid("Evidencia inválida"),
    decision: z.enum(["aprobada", "observada"], "Elige aprobar u observar"),
    note: z.string().trim().max(300, "Máximo 300 caracteres").optional().default(""),
  })
  .refine((v) => v.decision === "aprobada" || v.note.length >= 5, {
    path: ["note"],
    message: "Explica el motivo de la observación (mínimo 5 caracteres)",
  });

export const PRODUCT_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const PRODUCT_IMAGE_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;

export function validateProductImage(file: { type: string; size: number }): string | null {
  if (!(file.type in PRODUCT_IMAGE_TYPES)) return "Usa una foto JPG, PNG o WEBP.";
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) return "La foto supera los 2 MB.";
  return null;
}

const price = (label: string) =>
  z.coerce
    .number(`Ingresa el ${label}`)
    .positive(`El ${label} debe ser mayor a 0`)
    .max(99999, `El ${label} es demasiado alto`)
    .transform((v) => Math.round(v * 100) / 100);

/** HU09: producto con precio por unidad y por docena. */
export const productSchema = z
  .object({
    name: z.string().trim().min(3, "Escribe el nombre del producto").max(80),
    category: z.enum(CATEGORIES, "Elige una categoría"),
    description: optionalText(400),
    price_unit: price("precio por unidad"),
    price_dozen: price("precio por docena"),
    min_order: z.coerce.number().int("Usa un número entero").min(1, "Mínimo 1").max(10000),
    image_url: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v : null))
      .refine(
        (v) =>
          v === null ||
          /^\/productos\/[a-z]+\.svg$/.test(v) ||
          /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/productos\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(v),
        "Imagen no permitida",
      ),
    active: z
      .string()
      .optional()
      .transform((v) => v === "on" || v === "true"),
  })
  .refine((v) => v.price_dozen <= v.price_unit * 12, {
    path: ["price_dozen"],
    message: "La docena no puede costar más que 12 unidades sueltas",
  });
