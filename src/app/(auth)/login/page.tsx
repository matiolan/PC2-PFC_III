import type { Metadata } from "next";
import Link from "next/link";
import { Alert } from "@/components/ui";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Ingresar · Gamarra Conecta" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Bienvenido de vuelta</h1>
      <p className="mt-2 text-sm text-ink-500">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-brand-600 hover:underline">
          Regístrate gratis
        </Link>
      </p>
      {error === "enlace" && (
        <Alert tone="error" className="mt-6">
          El enlace no es válido o ya expiró. Solicita uno nuevo.
        </Alert>
      )}
      <SignInForm next={typeof next === "string" ? next : undefined} />
      <div className="mt-8 rounded-2xl bg-white p-4 text-xs text-ink-500 ring-1 ring-ink-200">
        <p className="font-semibold text-ink-700">Cuentas de demostración</p>
        <p className="mt-1">
          gestor@ · emprendedor@ · trabajador@ · comprador@ <span className="text-ink-400">gamarraconecta.pe</span>
        </p>
        <p className="mt-0.5">
          Contraseña: <code className="rounded bg-ink-100 px-1 py-0.5 text-ink-700">Demo2026!</code>
        </p>
      </div>
    </>
  );
}
