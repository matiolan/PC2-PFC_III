import type { Role } from "@/lib/domain";

export type NavItem = { href: string; label: string; icon: string };

/** Menú del panel por rol. */
export const PANEL_NAV: Record<Role, NavItem[]> = {
  emprendedor: [
    { href: "/panel", label: "Resumen", icon: "home" },
    { href: "/panel/negocio", label: "Mi negocio", icon: "store" },
    { href: "/panel/formalizacion", label: "Formalización", icon: "route" },
    { href: "/panel/productos", label: "Productos", icon: "package" },
    { href: "/panel/ofertas", label: "Ofertas de empleo", icon: "briefcase" },
  ],
  trabajador: [
    { href: "/panel", label: "Resumen", icon: "home" },
    { href: "/empleos", label: "Buscar empleos", icon: "search" },
    { href: "/panel/postulaciones", label: "Mis postulaciones", icon: "briefcase" },
  ],
  comprador: [
    { href: "/panel", label: "Resumen", icon: "home" },
    { href: "/vitrina", label: "Vitrina mayorista", icon: "store" },
  ],
  gestor: [
    { href: "/panel", label: "Resumen", icon: "home" },
    { href: "/panel/verificaciones", label: "Verificaciones", icon: "check" },
    { href: "/panel/indicadores", label: "Indicadores", icon: "chart" },
    { href: "/panel/auditoria", label: "Auditoría", icon: "log" },
  ],
};
