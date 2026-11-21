# ADR 0001 — Stack tecnológico

- **Estado:** Aceptado
- **Issue:** PFC-6

## Contexto

La PC2 requiere un prototipo desplegado con gestión ágil en Jira, pipelines ordenados en GitHub, programación segura, una landing muy visual y un sistema con excelente UX, todo en poco tiempo.

## Decisión

| Capa | Tecnología | Motivo |
|---|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions) + TypeScript estricto | SSR/SSG, seguridad del lado servidor, integración nativa con Vercel |
| UI | Tailwind CSS 4 + shadcn/ui | Diseño consistente y rápido de construir |
| Animación | Motion (Framer Motion), Lottie, video optimizado | Landing con movimiento sin sacrificar rendimiento |
| Backend | Supabase (Postgres, Auth, Storage, Realtime) | Auth y RLS listos; migraciones SQL versionadas |
| Validación | Zod | Mismo esquema en cliente y servidor |
| Pruebas | Vitest + Testing Library, Playwright (E2E) | Rápidas y ejecutables en CI |
| CI/CD | GitHub Actions + Vercel | Checks por PR, preview por rama, producción desde `main` |
| Seguridad | CodeQL, Gitleaks, Dependency Review, npm audit, Dependabot | DevSecOps en cada PR |

## Arquitectura

```
Navegador ──HTTPS──▶ Vercel (Edge proxy.ts → Server Components / Server Actions)
                              │
                              ▼
                     Supabase (Auth · Postgres con RLS · Storage)
```

## Consecuencias

- Toda tabla nueva exige RLS y políticas en una migración.
- La `service_role` key solo vive en variables de servidor de Vercel.
- El repositorio es público para usar CodeQL y Dependency Review sin costo.
