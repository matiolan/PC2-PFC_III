"use client";

import { useActionState } from "react";
import { updatePasswordAction } from "../actions";
import { Alert, Field } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { PasswordInput } from "@/components/password-input";
import type { FormState } from "@/lib/validation";

export default function ActualizarClavePage() {
  const [state, action] = useActionState<FormState, FormData>(updatePasswordAction, {});
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Crea una nueva contraseña</h1>
      <p className="mt-2 text-sm text-ink-500">Usa al menos 8 caracteres con letras y números.</p>
      <form action={action} className="mt-8 flex flex-col gap-5" noValidate>
        {state.message && <Alert tone="error">{state.message}</Alert>}
        <Field label="Nueva contraseña" htmlFor="password" error={state.errors?.password?.[0]}>
          <PasswordInput id="password" name="password" autoComplete="new-password" invalid={!!state.errors?.password} />
        </Field>
        <Field label="Repite la contraseña" htmlFor="confirm" error={state.errors?.confirm?.[0]}>
          <PasswordInput id="confirm" name="confirm" autoComplete="new-password" invalid={!!state.errors?.confirm} />
        </Field>
        <SubmitButton size="lg">Guardar contraseña</SubmitButton>
      </form>
    </>
  );
}
