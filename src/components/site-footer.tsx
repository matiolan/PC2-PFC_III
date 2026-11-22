import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-ink-950 text-white/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo dark />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            Plataforma para que los negocios de Gamarra, de galería o de la calle, se formalicen paso a paso y lo
            conviertan en más ventas y mejor empleo.
          </p>
          <p className="mt-4 text-xs text-white/40">
            Prototipo académico · PC2 Proyecto Final de Carrera III · USIL 2026. Datos de demostración; la validación
            ante SUNAT y la municipalidad es simulada.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Explora</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/vitrina">Vitrina mayorista</Link></li>
            <li><Link className="hover:text-white" href="/galerias">Directorio de galerías</Link></li>
            <li><Link className="hover:text-white" href="/empleos">Empleos formales</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Tu cuenta</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/registro">Crear cuenta</Link></li>
            <li><Link className="hover:text-white" href="/login">Ingresar</Link></li>
            <li><Link className="hover:text-white" href="/recuperar">Recuperar contraseña</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
