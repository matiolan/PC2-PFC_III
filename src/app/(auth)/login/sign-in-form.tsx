"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction } from "../actions";
import { Alert, Field, Input } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { PasswordInput } from "@/components/password-input";
import type { FormState } from "@/lib/validation";

export function SignInForm({ next }: { next?: string }) {
  const [state, action] = useActionState<FormState, FormData>(signInAction, {});
  return (
    <form action={action} className="mt-8 flex flex-col gap-5" noValidate>
      {state.message && <Alert tone="error">{state.message}</Alert>}
      <input type="hidden" name="next" value={next ?? "/panel"} />
      <Field label="Correo electrónico" htmlFor="email" error={state.errors?.email?.[0]}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.values?.email}
          aria-invalid={!!state.errors?.email}
          required
        />
      </Field>
      <Field label="Contraseña" htmlFor="password" error={state.errors?.password?.[0]}>
        <PasswordInput id="password" name="password" autoComplete="current-password" invalid={!!state.errors?.password} />
      </Field>
      <div className="-mt-2 text-right">
        <Link href="/recuperar" className="text-sm font-medium text-brand-600 hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
      <SubmitButton size="lg" pendingText="Ingresando…">
        Ingresar
      </SubmitButton>
    </form>
  );
}
