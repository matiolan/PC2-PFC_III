"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageCircle, Minus, Plus, X } from "lucide-react";
import clsx from "clsx";
import { buildQuoteMessage, whatsappUrl } from "@/lib/domain";

/** HU12: cotización por WhatsApp con mensaje prellenado y cantidad editable. */
export function QuoteButton({
  businessName,
  whatsapp,
  productName,
  minOrder = 12,
  variant = "solid",
  className,
}: {
  businessName: string;
  whatsapp: string;
  productName?: string;
  minOrder?: number;
  variant?: "solid" | "soft";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(Math.max(minOrder, 1));
  const [message, setMessage] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  const compose = (quantity: number) =>
    buildQuoteMessage({ businessName, productName, quantity: productName ? quantity : undefined });

  function changeQty(next: number) {
    const value = Math.max(1, Math.min(100000, next));
    setQty(value);
    setMessage(compose(value));
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    dialogRef.current?.querySelector<HTMLElement>("textarea")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setMessage(compose(qty));
          setOpen(true);
        }}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition",
          variant === "solid"
            ? "h-11 bg-[#1faa53] px-5 text-sm text-white shadow-[0_8px_20px_-8px_rgb(31_170_83/0.7)] hover:bg-[#178a43]"
            : "h-9 bg-[#e8f8ee] px-3 text-sm text-[#146c36] hover:bg-[#d3f2df]",
          className,
        )}
      >
        <MessageCircle className="size-4" aria-hidden /> {productName ? "Cotizar" : "Cotizar por WhatsApp"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-end bg-ink-950/40 p-4 backdrop-blur-sm sm:place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="quote-title"
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ type: "spring", damping: 24, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p id="quote-title" className="text-lg font-semibold text-ink-900">Cotizar con {businessName}</p>
                  {productName && <p className="text-sm text-ink-500">{productName}</p>}
                </div>
                <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100" aria-label="Cerrar">
                  <X className="size-5" />
                </button>
              </div>
              {productName && (
                <div className="mt-5 flex items-center justify-between rounded-2xl bg-ink-50 p-3 ring-1 ring-ink-100">
                  <span className="text-sm text-ink-600">Cantidad (unidades)</span>
                  <div className="flex items-center gap-2">
                    <button type="button" aria-label="Restar una docena" onClick={() => changeQty(qty - 12)} className="grid size-8 place-items-center rounded-lg bg-white ring-1 ring-ink-200 hover:bg-ink-100">
                      <Minus className="size-4" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={qty}
                      onChange={(e) => changeQty(Number(e.target.value) || 1)}
                      className="h-8 w-20 rounded-lg bg-white text-center text-sm font-semibold ring-1 ring-ink-200"
                      aria-label="Cantidad"
                    />
                    <button type="button" aria-label="Sumar una docena" onClick={() => changeQty(qty + 12)} className="grid size-8 place-items-center rounded-lg bg-white ring-1 ring-ink-200 hover:bg-ink-100">
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>
              )}
              <label htmlFor="quote-msg" className="mt-5 block text-sm font-medium text-ink-800">
                Mensaje
              </label>
              <textarea
                id="quote-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 600))}
                className="mt-1.5 min-h-28 w-full rounded-xl bg-white px-3.5 py-2.5 text-sm ring-1 ring-ink-200 focus:outline-none focus:ring-2 focus:ring-[#1faa53]"
              />
              <a
                href={whatsappUrl(whatsapp, message)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1faa53] text-sm font-semibold text-white hover:bg-[#178a43]"
              >
                <MessageCircle className="size-5" aria-hidden /> Abrir WhatsApp
              </a>
              <p className="mt-3 text-center text-xs text-ink-400">Se abre WhatsApp con el mensaje listo; no guardamos tu conversación.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
