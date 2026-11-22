import { z } from "zod";
import { SELF_SERVICE_ROLES } from "@/lib/domain";

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
