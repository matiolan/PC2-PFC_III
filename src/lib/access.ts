import type { Role } from "@/lib/domain";

/** Matriz de acceso del panel por rol (HU03). Cada página la aplica con requireRole y la BD con RLS. */
export const ROUTE_ROLES: { prefix: string; roles: Role[] }[] = [
  { prefix: "/panel/verificaciones", roles: ["gestor"] },
  { prefix: "/panel/indicadores", roles: ["gestor"] },
  { prefix: "/panel/auditoria", roles: ["gestor"] },
  { prefix: "/panel/negocio", roles: ["emprendedor"] },
  { prefix: "/panel/formalizacion", roles: ["emprendedor"] },
  { prefix: "/panel/productos", roles: ["emprendedor"] },
  { prefix: "/panel/ofertas", roles: ["emprendedor"] },
  { prefix: "/panel/postulaciones", roles: ["trabajador"] },
];

export function rolesFor(pathname: string): Role[] | null {
  const match = ROUTE_ROLES.find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));
  return match ? match.roles : null;
}

export function canAccess(role: Role, pathname: string): boolean {
  if (!pathname.startsWith("/panel")) return true;
  const roles = rolesFor(pathname);
  return roles === null || roles.includes(role);
}
