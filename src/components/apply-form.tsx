"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { applyAction } from "@/app/(public)/empleos/actions";
import { Alert, Field, Input, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "@/lib/validation";

export function ApplyForm({ offerId, phone }: { offerId: string; phone: string }) {
  const [state, action] = useActionState<FormState, FormData>(applyAction, {});
  if (state.ok) return <Alert tone="success" title="Postulación enviada">{state.message}</Alert>;
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="offer_id" value={offerId} />
      {state.message && <Alert tone="error">{state.message}</Alert>}
      <Field label="Celular de contacto" htmlFor="phone" error={state.errors?.phone?.[0]}>
        <Input id="phone" name="phone" inputMode="numeric" defaultValue={state.values?.phone ?? phone} placeholder="987654321" />
      </Field>
      <Field label="Mensaje para el empleador (opcional)" htmlFor="message" hint="Cuenta tu experiencia en pocas líneas." error={state.errors?.message?.[0]}>
        <Textarea id="message" name="message" maxLength={500} defaultValue={state.values?.message} />
      </Field>
      <SubmitButton size="lg" pendingText="Enviando…">
        <Send className="size-4" aria-hidden /> Postular
      </SubmitButton>
    </form>
  );
}
