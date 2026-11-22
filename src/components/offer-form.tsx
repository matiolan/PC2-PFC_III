"use client";

import { useActionState, useState } from "react";
import { saveOfferAction } from "@/app/panel/ofertas/actions";
import { Alert, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { CONTRACT_TYPES, formatSoles, minimumSalary, type ContractType } from "@/lib/domain";
import type { Tables } from "@/lib/database.types";
import type { FormState } from "@/lib/validation";

/** HU14: formulario de oferta con validación de sueldo mínimo en vivo. */
export function OfferForm({ offer, rmv }: { offer?: Tables<"job_offers">; rmv: number }) {
  const [state, action] = useActionState<FormState, FormData>(saveOfferAction, {});
  const v = (k: keyof Tables<"job_offers">) => state.values?.[k] ?? (offer?.[k] != null ? String(offer[k]) : "");
  const [contract, setContract] = useState<ContractType>((v("contract_type") as ContractType) || "Plazo indeterminado");
  const [salary, setSalary] = useState(v("salary"));
  const min = minimumSalary(contract, rmv);
  const below = salary !== "" && Number(salary) < min;
  const err = (k: string) => state.errors?.[k]?.[0];

  return (
    <form action={action} noValidate>
      <input type="hidden" name="id" value={offer?.id ?? ""} />
      <Card className="flex flex-col gap-5 p-5 sm:p-7">
        {state.message && <Alert tone="error">{state.message}</Alert>}
        <Field label="Puesto" htmlFor="title" error={err("title")}>
          <Input id="title" name="title" defaultValue={v("title")} placeholder="Ej. Operaria de máquina remalladora" />
        </Field>
        <Field label="Funciones y requisitos" htmlFor="description" error={err("description")}>
          <Textarea id="description" name="description" defaultValue={v("description")} maxLength={1000} className="min-h-32" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Tipo de contrato" htmlFor="contract_type" error={err("contract_type")}>
            <Select id="contract_type" name="contract_type" value={contract} onChange={(e) => setContract(e.target.value as ContractType)}>
              {CONTRACT_TYPES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field
            label="Sueldo mensual (S/)"
            htmlFor="salary"
            hint={`Mínimo ${formatSoles(min)} ${contract === "Tiempo parcial" ? "(mitad de la RMV)" : "(RMV vigente)"}`}
            error={err("salary") ?? (below ? `Debe ser al menos ${formatSoles(min)}` : undefined)}
          >
            <Input id="salary" name="salary" inputMode="decimal" value={salary} onChange={(e) => setSalary(e.target.value)} aria-invalid={below || !!err("salary")} />
          </Field>
          <Field label="Horario" htmlFor="schedule" error={err("schedule")}>
            <Input id="schedule" name="schedule" defaultValue={v("schedule")} placeholder="Lunes a sábado, 8:00 a 17:00" />
          </Field>
          <Field label="Vacantes" htmlFor="vacancies" error={err("vacancies")}>
            <Input id="vacancies" name="vacancies" inputMode="numeric" defaultValue={v("vacancies") || "1"} />
          </Field>
        </div>
        <Alert tone="info">
          Gamarra Conecta solo publica empleos con sueldo igual o mayor a la Remuneración Mínima Vital ({formatSoles(rmv)}) y con horario y contrato claros.
        </Alert>
        <div className="flex justify-end border-t border-ink-100 pt-5">
          <SubmitButton size="lg" disabled={below}>
            {offer ? "Guardar cambios" : "Publicar oferta"}
          </SubmitButton>
        </div>
      </Card>
    </form>
  );
}
