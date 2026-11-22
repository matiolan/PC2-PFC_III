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
