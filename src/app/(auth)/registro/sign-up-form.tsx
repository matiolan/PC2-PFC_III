"use client";

import { useActionState, useState } from "react";
import clsx from "clsx";
import { Briefcase, Check, ShoppingBag, Store } from "lucide-react";
import { signUpAction } from "../actions";
import { Alert, Field, Input } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { PasswordInput } from "@/components/password-input";
import { ROLE_INFO, SELF_SERVICE_ROLES, type SelfServiceRole } from "@/lib/domain";
import type { FormState } from "@/lib/validation";

const ICONS = { comprador: ShoppingBag, emprendedor: Store, trabajador: Briefcase } as const;

export function SignUpForm({ defaultRole }: { defaultRole?: string }) {
  const [state, action] = useActionState<FormState, FormData>(signUpAction, {});
  const initial = (SELF_SERVICE_ROLES as readonly string[]).includes(state.values?.role ?? defaultRole ?? "")
    ? ((state.values?.role ?? defaultRole) as SelfServiceRole)
    : "emprendedor";
  const [role, setRole] = useState<SelfServiceRole>(initial);

  if (state.ok) {
    return (
      <Alert tone="success" title="¡Cuenta creada!" className="mt-8">
        {state.message}
      </Alert>
    );
  }

  return (
    <form action={action} className="mt-8 flex flex-col gap-5" noValidate>
      {state.message && <Alert tone="error">{state.message}</Alert>}

      <fieldset>
        <legend className="text-sm font-medium text-ink-800">¿Cómo usarás Gamarra Conecta?</legend>
        <div className="mt-2 grid gap-2.5" role="radiogroup">
          {SELF_SERVICE_ROLES.map((r) => {
            const Icon = ICONS[r];
            const active = role === r;
            return (
              <label
                key={r}
                className={clsx(
                  "relative flex cursor-pointer items-start gap-3 rounded-2xl p-4 ring-1 transition",
                  active ? "bg-brand-50/70 ring-2 ring-brand-500" : "bg-white ring-ink-200 hover:ring-ink-300",
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={active}
                  onChange={() => setRole(r)}
                  className="sr-only"
                />
                <span
                  className={clsx(
                    "grid size-10 shrink-0 place-items-center rounded-xl transition",
                    active ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-600",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-ink-900">{ROLE_INFO[r].label}</span>
                  <span className="mt-0.5 block text-xs text-ink-500">{ROLE_INFO[r].description}</span>
                </span>
                {active && <Check className="size-5 text-brand-600" aria-hidden />}
              </label>
            );
          })}
        </div>
        {state.errors?.role && <p className="mt-1.5 text-xs text-red-600">{state.errors.role[0]}</p>}
      </fieldset>

      <Field label="Nombre completo" htmlFor="fullName" error={state.errors?.fullName?.[0]}>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          defaultValue={state.values?.fullName}
          aria-invalid={!!state.errors?.fullName}
          placeholder="Ej. Rosa Quispe Mamani"
          required
        />
      </Field>
      <Field label="Correo electrónico" htmlFor="email" error={state.errors?.email?.[0]}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.values?.email}
          aria-invalid={!!state.errors?.email}
          placeholder="tucorreo@ejemplo.com"
          required
        />
      </Field>
      <Field
        label="Contraseña"
        htmlFor="password"
        hint="Mínimo 8 caracteres, con letras y números."
        error={state.errors?.password?.[0]}
      >
        <PasswordInput id="password" name="password" autoComplete="new-password" invalid={!!state.errors?.password} />
      </Field>

      <SubmitButton size="lg" pendingText="Creando tu cuenta…">
        Crear cuenta de {ROLE_INFO[role].label.toLowerCase()}
      </SubmitButton>
      <p className="text-center text-xs text-ink-400">
        El rol de gestor de galería lo asigna la asociación; no se puede elegir al registrarse.
      </p>
    </form>
  );
}
