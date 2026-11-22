import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = { title: "Crear cuenta · Gamarra Conecta" };

export default async function RegistroPage({ searchParams }: PageProps<"/registro">) {
  const { rol } = await searchParams;
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Crea tu cuenta</h1>
      <p className="mt-2 text-sm text-ink-500">
        ¿Ya tienes una?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Inicia sesión
        </Link>
      </p>
      <SignUpForm defaultRole={typeof rol === "string" ? rol : undefined} />
    </>
  );
}
