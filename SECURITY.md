# Política de seguridad

## Reporte de vulnerabilidades

Reporta cualquier vulnerabilidad de forma privada desde **Security → Report a vulnerability** en este repositorio. No abras issues públicos con detalles explotables.

## Controles implementados

| Capa | Control |
|---|---|
| Código | SAST con CodeQL (`security-extended`) en cada PR y semanal |
| Secretos | Gitleaks en cada push/PR; `.env*` ignorado; variables solo en Vercel |
| Dependencias | Dependency Review (bloquea severidad alta), `npm audit`, Dependabot |
| Aplicación | Cabeceras CSP, HSTS, X-Frame-Options, nosniff, Referrer y Permissions Policy |
| Datos | Supabase con Row Level Security obligatorio en todas las tablas |
| Autenticación | Supabase Auth con cookies httpOnly vía `@supabase/ssr` y refresco en `proxy.ts` |
| Entradas | Validación con Zod en cliente y servidor |
| Proceso | `main` protegida: PR + checks obligatorios, sin push directo |
