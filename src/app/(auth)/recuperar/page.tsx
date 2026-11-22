"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requestResetAction } from "../actions";
import { Alert, Field, Input } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "@/lib/validation";

export default function RecuperarPage() {
  const [state, action] = useActionState<FormState, FormData>(requestResetAction, {});
  return (
    <>
      <Link href="/login" className="mb-6 inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft className="size-4" /> Volver
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Recupera tu contraseña</h1>
      <p className="mt-2 text-sm text-ink-500">Te enviaremos un enlace seguro que vence en una hora.</p>
      {state.ok ? (
        <Alert tone="success" className="mt-8">
          {state.message}
        </Alert>
      ) : (
        <form action={action} className="mt-8 flex flex-col gap-5" noValidate>
          {state.message && <Alert tone="error">{state.message}</Alert>}
          <Field label="Correo electrónico" htmlFor="email" error={state.errors?.email?.[0]}>
            <Input id="email" name="email" type="email" autoComplete="email" defaultValue={state.values?.email} required />
          </Field>
          <SubmitButton size="lg" pendingText="Enviando…">
            Enviar enlace
          </SubmitButton>
        </form>
      )}
    </>
  );
}
