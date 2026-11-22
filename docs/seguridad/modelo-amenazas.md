# Modelo de amenazas (STRIDE) por épica

| Épica | Amenaza (STRIDE) | Escenario | Mitigación implementada |
|---|---|---|---|
| E1 Acceso y roles | **S**poofing | Robo de sesión o fuerza bruta | Supabase Auth, cookies httpOnly/Secure, límite de intentos por IP, mensajes genéricos |
| E1 Acceso y roles | **E**levation of privilege | Registrarse como gestor | El rol gestor no se acepta en el registro (trigger y Zod); lo asigna la asociación |
| E2 Formalización | **I**nformation disclosure | Acceso a DNI/RUC de otro negocio | Bucket privado por carpeta de usuario, URL firmadas de 5 min, RLS por dueño y ámbito del gestor |
| E2 Formalización | **T**ampering | Subir el nivel sin aprobación | La columna `level` no tiene permiso de escritura; la calcula un trigger tras la aprobación |
| E2 Formalización | **R**epudiation | Negar una verificación | `audit_log` escrito por triggers, sin permisos de escritura ni borrado |
| E3 Vitrina | **T**ampering | Inyección en filtros de búsqueda | `sanitizeSearch`, consultas parametrizadas de PostgREST |
| E3 Vitrina | **I**nformation disclosure | Imágenes de orígenes externos (rastreo) | Solo ilustraciones propias o el bucket público `productos`; CSP de imágenes restringida |
| E4 Empleo | **T**ampering | Publicar sueldos menores a la RMV | Validación en interfaz, Server Action y trigger de la BD |
| E4 Empleo | **I**nformation disclosure | Ver datos de postulantes ajenos | RLS: el empleador solo ve postulantes de sus ofertas |
| E5 Indicadores | **T**ampering | Inyección de fórmulas en CSV | `csvCell` neutraliza `= + - @` |
| E5 Indicadores | **E**levation of privilege | Llamar `gestor_stats` sin ser gestor | La función valida el rol internamente |
| E6 Pública | **D**enial of service | Abuso de formularios | Límite de intentos, firewall de Vercel |
| E7 DevSecOps | **T**ampering | Dependencias o secretos comprometidos | Dependency Review, npm audit, Dependabot, Gitleaks, ramas protegidas |
