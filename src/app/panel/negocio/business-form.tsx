"use client";

import { useActionState, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";
import { Building2, MapPin } from "lucide-react";
import { saveBusinessAction } from "./actions";
import { Alert, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { CATEGORIES } from "@/lib/domain";
import type { Tables } from "@/lib/database.types";
import type { FormState } from "@/lib/validation";

export function BusinessForm({
  business,
  galleries,
}: {
  business: Tables<"businesses"> | null;
  galleries: { id: string; name: string }[];
}) {
  const [state, action] = useActionState<FormState, FormData>(saveBusinessAction, {});
  const v = (key: keyof Tables<"businesses">) => state.values?.[key] ?? (business?.[key] as string | null) ?? "";
  const [location, setLocation] = useState<"galeria" | "via_publica">(
    (v("location_type") as "galeria" | "via_publica") || "galeria",
  );
  const err = (k: string) => state.errors?.[k]?.[0];

  return (
    <form action={action} noValidate>
      <Card className="flex flex-col gap-6 p-5 sm:p-7">
        {state.message && <Alert tone={state.ok ? "success" : "error"}>{state.message}</Alert>}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nombre comercial" htmlFor="name" error={err("name")}>
            <Input id="name" name="name" defaultValue={v("name")} aria-invalid={!!err("name")} placeholder="Ej. Confecciones Ñusta" />
          </Field>
          <Field label="Rubro principal" htmlFor="category" error={err("category")}>
            <Select id="category" name="category" defaultValue={v("category") || ""} aria-invalid={!!err("category")}>
              <option value="" disabled>
                Elige un rubro
              </option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Descripción" htmlFor="description" hint="Qué vendes, desde cuántas unidades y qué te diferencia." error={err("description")}>
          <Textarea id="description" name="description" defaultValue={v("description")} maxLength={500} />
        </Field>

        <fieldset>
          <legend className="text-sm font-medium text-ink-800">¿Dónde está tu negocio?</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {(
              [
                { value: "galeria", label: "En una galería", desc: "Tengo stand en una galería o centro comercial.", icon: Building2 },
                { value: "via_publica", label: "En la vía pública", desc: "Vendo en la calle o en un puesto temporal.", icon: MapPin },
              ] as const
            ).map((opt) => (
              <label
                key={opt.value}
                className={clsx(
                  "flex cursor-pointer gap-3 rounded-2xl p-4 ring-1 transition",
                  location === opt.value ? "bg-brand-50/70 ring-2 ring-brand-500" : "ring-ink-200 hover:ring-ink-300",
                )}
              >
                <input
                  type="radio"
                  name="location_type"
                  value={opt.value}
                  checked={location === opt.value}
                  onChange={() => setLocation(opt.value)}
                  className="sr-only"
                />
                <opt.icon className={clsx("mt-0.5 size-5", location === opt.value ? "text-brand-600" : "text-ink-400")} aria-hidden />
                <span>
                  <span className="block text-sm font-semibold text-ink-900">{opt.label}</span>
                  <span className="block text-xs text-ink-500">{opt.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <AnimatePresence mode="wait" initial={false}>
          {location === "galeria" ? (
            <motion.div
              key="galeria"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="grid gap-5 sm:grid-cols-[2fr_1fr_1fr]"
            >
              <Field label="Galería" htmlFor="gallery_id" error={err("gallery_id")}>
                <Select id="gallery_id" name="gallery_id" defaultValue={v("gallery_id")} aria-invalid={!!err("gallery_id")}>
                  <option value="">Elige tu galería</option>
                  {galleries.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Piso" htmlFor="floor" error={err("floor")}>
                <Input id="floor" name="floor" defaultValue={v("floor")} placeholder="3" />
              </Field>
              <Field label="Stand" htmlFor="stand" error={err("stand")}>
                <Input id="stand" name="stand" defaultValue={v("stand")} aria-invalid={!!err("stand")} placeholder="312" />
              </Field>
            </motion.div>
          ) : (
            <motion.div key="via" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <Field label="Zona o cuadra" htmlFor="zone" hint="Ej. Jr. Gamarra, cuadra 7, frente a la galería…" error={err("zone")}>
                <Input id="zone" name="zone" defaultValue={v("zone")} aria-invalid={!!err("zone")} />
              </Field>
            </motion.div>
          )}
        </AnimatePresence>

        <Field label="WhatsApp para cotizaciones" htmlFor="whatsapp" hint="Los compradores te escribirán a este número." error={err("whatsapp")}>
          <div className="flex">
            <span className="grid h-11 place-items-center rounded-l-xl bg-ink-100 px-3 text-sm text-ink-600 ring-1 ring-ink-200">+51</span>
            <Input
              id="whatsapp"
              name="whatsapp"
              inputMode="numeric"
              autoComplete="tel-national"
              defaultValue={v("whatsapp")}
              aria-invalid={!!err("whatsapp")}
              placeholder="987654321"
              className="rounded-l-none"
            />
          </div>
        </Field>

        <div className="flex justify-end border-t border-ink-100 pt-5">
          <SubmitButton size="lg">{business ? "Guardar cambios" : "Registrar mi negocio"}</SubmitButton>
        </div>
      </Card>
    </form>
  );
}
