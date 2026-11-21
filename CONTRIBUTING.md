# Flujo de trabajo

## Ramas (Git Flow simplificado)

| Rama | Uso | Despliegue |
|---|---|---|
| `main` | Producción. Protegida. | Vercel Production |
| `develop` | Integración del sprint. | Vercel Preview |
| `feature/PFC-xx-descripcion` | Historias y tareas | Preview por PR |
| `fix/PFC-xx-descripcion` | Corrección de errores | Preview por PR |

## Commits

Formato `PFC-xx tipo: mensaje` (Conventional Commits + clave Jira), por ejemplo:

```
PFC-8 ci: agrega pipeline de lint, tipos, tests y build
PFC-12 feat: login con Supabase Auth
PFC-14 security: cabeceras CSP y HSTS
```

Tipos: `feat`, `fix`, `ci`, `security`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`.

La clave `PFC-xx` hace que la rama, los commits y el PR aparezcan en el panel **Desarrollo** del issue en Jira.

## Pull Requests

1. Crea la rama desde `develop`.
2. Abre el PR hacia `develop` con título `PFC-xx tipo: descripción`.
3. Deben pasar **CI**, **Seguridad** y **Convenciones de PR**.
4. Revisa el Preview Deployment de Vercel y haz *squash merge*.
5. Al cerrar el sprint: PR `develop → main` para publicar en producción.

## Local

```bash
npm ci
cp .env.example .env.local   # completa con las claves de Supabase
npm run dev
npm run lint && npm run typecheck && npm test
```
