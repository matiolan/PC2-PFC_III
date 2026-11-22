"use client";

import { useActionState, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ExternalLink, MessageSquareWarning } from "lucide-react";
import { reviewEvidenceAction } from "./actions";
import { Alert, Badge, Button, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "@/lib/validation";

export type PendingEvidence = {
  id: string;
  businessName: string;
  place: string;
  owner: string;
  levelLabel: string;
  docLabel: string;
  docNumber: string;
  createdAt: string;
};

export function ReviewCard({ item }: { item: PendingEvidence }) {
  const [state, action] = useActionState<FormState, FormData>(reviewEvidenceAction, {});
  const [observing, setObserving] = useState(false);

  if (state.ok) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
        <Alert tone="success" title={item.businessName}>
          {state.message}
        </Alert>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink-900">{item.businessName}</p>
          <p className="text-xs text-ink-500">
            {item.owner} · {item.place} · enviado {item.createdAt}
          </p>
        </div>
        <Badge tone="warning">{item.levelLabel}</Badge>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ink-50 px-4 py-3 ring-1 ring-ink-100">
        <div className="text-sm">
          <p className="text-ink-500">{item.docLabel}</p>
          <p className="font-mono font-medium text-ink-900">{item.docNumber}</p>
        </div>
        <a
          href={`/panel/verificaciones/documento/${item.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
        >
          Ver documento <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </div>
      {state.message && <Alert tone="error">{state.message}</Alert>}
      <form action={action} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={item.id} />
        <AnimatePresence initial={false}>
          {observing && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <label htmlFor={`note-${item.id}`} className="text-sm font-medium text-ink-800">
                Motivo de la observación
              </label>
              <Textarea
                id={`note-${item.id}`}
                name="note"
                maxLength={300}
                className="mt-1.5"
                placeholder="Ej. La foto del RUC no es legible; vuelve a subirla con buena luz."
                aria-invalid={!!state.errors?.note}
              />
              {state.errors?.note && <p className="mt-1 text-xs text-red-600">{state.errors.note[0]}</p>}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex flex-wrap justify-end gap-2">
          {observing ? (
            <>
              <Button type="button" variant="ghost" onClick={() => setObserving(false)}>
                Cancelar
              </Button>
              <SubmitButton name="decision" value="observada" variant="danger" pendingText="Enviando…">
                <MessageSquareWarning className="size-4" aria-hidden /> Enviar observación
              </SubmitButton>
            </>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={() => setObserving(true)}>
                <MessageSquareWarning className="size-4" aria-hidden /> Observar
              </Button>
              <SubmitButton name="decision" value="aprobada" pendingText="Aprobando…">
                <Check className="size-4" aria-hidden /> Aprobar
              </SubmitButton>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
