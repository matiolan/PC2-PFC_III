import Link from "next/link";
import clsx from "clsx";
import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui";
import { getSession } from "@/lib/auth";

const NAV = [
  { href: "/vitrina", label: "Vitrina mayorista" },
  { href: "/galerias", label: "Galerías" },
  { href: "/empleos", label: "Empleos" },
];

export async function SiteHeader({ dark = false }: { dark?: boolean }) {
  const session = await getSession();
  return (
    <header
      className={clsx(
        "sticky top-0 z-40 border-b backdrop-blur-xl",
        dark ? "border-white/10 bg-ink-950/95" : "border-ink-200/70 bg-background/80",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Logo dark={dark} />
        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                dark ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {session ? (
            <ButtonLink href="/panel" size="sm">
              Mi panel
            </ButtonLink>
          ) : (
            <>
              <Link
                href="/login"
                className={clsx(
                  "hidden rounded-lg px-3 py-2 text-sm font-medium sm:block",
                  dark ? "text-white/80 hover:text-white" : "text-ink-700 hover:text-ink-900",
                )}
              >
                Ingresar
              </Link>
              <ButtonLink href="/registro" size="sm" variant={dark ? "accent" : "primary"}>
                Crear cuenta
              </ButtonLink>
            </>
          )}
        </div>
      </div>
      <nav aria-label="Principal móvil" className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ring-1",
              dark ? "text-white/80 ring-white/15" : "text-ink-700 ring-ink-200",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
