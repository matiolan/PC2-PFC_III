"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { LogoMark } from "@/components/logo";

/** Página de error genérica: no muestra detalles internos (OWASP A10). */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="bg-weave grid min-h-dvh place-items-center px-6 text-center">
      <div className="max-w-md">
        <LogoMark className="mx-auto size-14" />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-ink-900">Algo salió mal</h1>
        <p className="mt-3 text-ink-500">Tuvimos un problema al cargar esta sección. Inténtalo otra vez en unos segundos.</p>
        {error.digest && <p className="mt-2 font-mono text-xs text-ink-400">Código de referencia: {error.digest}</p>}
        <div className="mt-8 flex justify-center gap-3">
          <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700">
            <RotateCcw className="size-4" aria-hidden /> Reintentar
          </button>
          <Link href="/" className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-ink-900 ring-1 ring-ink-200 hover:bg-ink-50">Ir al inicio</Link>
        </div>
      </div>
    </main>
  );
}
