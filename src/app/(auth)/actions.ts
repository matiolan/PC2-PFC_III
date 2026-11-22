"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, siteOrigin } from "@/lib/request";
import {
  fieldErrors,
  formValues,
  newPasswordSchema,
  resetRequestSchema,
  safeNextPath,
  signInSchema,
  signUpSchema,
  type FormState,
} from "@/lib/validation";

const TOO_MANY = (s: number) => `Demasiados intentos. Vuelve a intentarlo en ${s} segundos.`;

/** HU01: registro eligiendo el rol (comprador, emprendedor o trabajador). */
export async function signUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  const parsed = signUpSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const limit = rateLimit(`signup:${await clientIp()}`, 5, 10 * 60_000);
  if (!limit.ok) return { message: TOO_MANY(limit.retryAfterSeconds), values };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName, role: parsed.data.role },
      emailRedirectTo: `${await siteOrigin()}/auth/confirm?next=/panel`,
    },
  });

  if (error) {
    const msg = /already|registered/i.test(error.message)
      ? "Ya existe una cuenta con este correo. Inicia sesión o recupera tu contraseña."
      : /password/i.test(error.message)
        ? "La contraseña no cumple los requisitos de seguridad. Elige una más robusta."
        : "No pudimos crear tu cuenta. Inténtalo nuevamente en unos minutos.";
    return { message: msg, values };
  }

  if (data.session) redirect("/panel?bienvenida=1");
  return { ok: true, message: "Te enviamos un correo para confirmar tu cuenta. Revisa tu bandeja de entrada." };
}

/** HU02: inicio de sesión con mensajes genéricos (no revela si el correo existe). */
export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  const parsed = signInSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: { email: values.email ?? "" } };

  const limit = rateLimit(`login:${await clientIp()}:${parsed.data.email}`, 8, 10 * 60_000);
  if (!limit.ok) return { message: TOO_MANY(limit.retryAfterSeconds), values: { email: parsed.data.email } };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    const msg = /confirm/i.test(error.message)
      ? "Confirma tu correo antes de iniciar sesión."
      : "Correo o contraseña incorrectos.";
    return { message: msg, values: { email: parsed.data.email } };
  }
  redirect(safeNextPath(values.next));
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/** HU02: solicitud de recuperación de contraseña (respuesta idéntica exista o no la cuenta). */
export async function requestResetAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  const parsed = resetRequestSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const limit = rateLimit(`reset:${await clientIp()}`, 3, 15 * 60_000);
  if (!limit.ok) return { message: TOO_MANY(limit.retryAfterSeconds), values };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await siteOrigin()}/auth/confirm?next=/actualizar-clave`,
  });
  return {
    ok: true,
    message: "Si el correo está registrado, recibirás un enlace para crear una nueva contraseña.",
  };
}

/** HU02: nueva contraseña tras abrir el enlace de recuperación. */
export async function updatePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = newPasswordSchema.safeParse(formValues(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { message: "El enlace expiró. Solicita uno nuevo." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { message: "No se pudo actualizar la contraseña. Usa una diferente a la anterior." };
  redirect("/panel?clave=actualizada");
}
