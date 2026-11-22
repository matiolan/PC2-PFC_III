"use client";

import { motion } from "motion/react";
import clsx from "clsx";
import { Check, Clock, Lock, AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { LEVELS } from "@/lib/domain";

export type StepEvidence = { level: number; status: string; review_note: string | null } | undefined;

/** HU05: ruta de formalización con el nivel actual, lo logrado y lo que falta. */
export function FormalizationRoute({
  level,
  evidenceByLevel,
  nextStepSlot,
}: {
  level: number;
  evidenceByLevel: Record<number, StepEvidence>;
  nextStepSlot?: ReactNode;
}) {
  return (
    <ol className="relative flex flex-col gap-4">
      {LEVELS.map((step, i) => {
        const done = step.level <= level;
        const isNext = step.level === level + 1;
        const ev = evidenceByLevel[step.level];
        const pending = ev?.status === "pendiente";
        const observed = ev?.status === "observada";
        return (
          <motion.li
            key={step.level}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="relative flex gap-4"
          >
            {i < LEVELS.length - 1 && (
              <span
                aria-hidden
                className={clsx(
                  "absolute left-[1.15rem] top-11 h-[calc(100%-1.5rem)] w-0.5",
                  step.level < level ? "bg-gradient-to-b from-brand-500 to-brand-300" : "bg-ink-200",
                )}
              />
            )}
            <span
              className={clsx(
                "relative z-10 grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold ring-4 ring-background",
                done && "bg-gradient-to-br from-brand-500 to-saffron-500 text-white",
                isNext && !done && "bg-white text-brand-700 ring-brand-100 outline-2 outline-brand-500",
                !done && !isNext && "bg-ink-100 text-ink-400",
              )}
            >
              {done ? <Check className="size-5" aria-hidden /> : !isNext ? <Lock className="size-4" aria-hidden /> : step.level}
            </span>
            <div
              className={clsx(
                "flex-1 rounded-2xl p-4 ring-1 transition",
                isNext ? "bg-white shadow-[var(--shadow-lift)] ring-brand-200" : done ? "bg-white/80 ring-ink-200/70" : "bg-white/40 ring-ink-200/50",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className={clsx("font-semibold", done || isNext ? "text-ink-900" : "text-ink-500")}>
                  Nivel {step.level} · {step.name}
                </p>
                {done && <span className="text-xs font-medium text-mint-600">Logrado</span>}
                {pending && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-saffron-600">
                    <Clock className="size-3.5" aria-hidden /> En revisión
                  </span>
                )}
                {observed && isNext && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                    <AlertTriangle className="size-3.5" aria-hidden /> Observada
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-ink-500">
                {step.level === 0 ? "Registraste tu negocio en la plataforma." : `Requisito: ${step.docLabel}.`}{" "}
                <span className="text-ink-700">{step.benefit}</span>
              </p>
              {observed && isNext && ev?.review_note && (
                <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">Motivo: {ev.review_note}</p>
              )}
              {isNext && nextStepSlot && <div className="mt-4">{nextStepSlot}</div>}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
