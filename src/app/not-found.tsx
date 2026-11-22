import Link from "next/link";
import { LogoMark } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="bg-weave grid min-h-dvh place-items-center px-6 text-center">
      <div className="max-w-md">
        <LogoMark className="mx-auto size-14" />
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Error 404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">No encontramos esta página</h1>
        <p className="mt-3 text-ink-500">Quizá el negocio cambió de nombre o el enlace está incompleto.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700">Ir al inicio</Link>
          <Link href="/vitrina" className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-ink-900 ring-1 ring-ink-200 hover:bg-ink-50">Ver la vitrina</Link>
        </div>
      </div>
    </main>
  );
}
