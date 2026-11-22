"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import clsx from "clsx";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Briefcase,
  Building2,
  ClipboardCheck,
  Eye,
  FileLock2,
  Fingerprint,
  Landmark,
  Lock,
  MessageCircle,
  Search,
  ScrollText,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import { CountUp } from "./count-up";
import type { PublicStats } from "./hero";

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

function Eyebrow({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return <p className={clsx("text-xs font-semibold uppercase tracking-[0.18em]", dark ? "text-saffron-400" : "text-brand-600")}>{children}</p>;
}

/* ---------- Marquesina ---------- */
export function Marquee({ items }: { items: string[] }) {
  const list = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-ink-950 py-4" aria-hidden>
      <div className="animate-marquee flex w-max gap-10 whitespace-nowrap text-sm font-medium text-white/45">
        {list.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            {t} <span className="size-1.5 rounded-full bg-saffron-500/70" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Problema / solución ---------- */
const problems = [
  {
    icon: Eye,
    problem: "El comprador no distingue a un proveedor confiable entre miles de stands y puestos.",
    solution: "Insignias verificadas por el gestor y vitrina que prioriza a los negocios formalizados.",
  },
  {
    icon: TrendingUp,
    problem: "Formalizarse se siente como un costo sin beneficio inmediato.",
    solution: "Cada nivel aprobado trae más visibilidad, cotizaciones por WhatsApp y acceso a empresas.",
  },
  {
    icon: Users,
    problem: "El empleo se ofrece de palabra, sin sueldo ni contrato claros.",
    solution: "Bolsa de empleo que exige sueldo igual o mayor a la RMV, horario y tipo de contrato.",
  },
  {
    icon: BarChart3,
    problem: "Las asociaciones no tienen datos para medir la formalización.",
    solution: "Panel de indicadores por galería, auditoría y reportes exportables para la municipalidad.",
  },
];

export function ProblemSolution() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div {...reveal} className="max-w-2xl">
          <Eyebrow>Por qué Gamarra Conecta</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-5xl">La informalidad no se combate con multas, se gana con clientes.</h2>
        </motion.div>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {problems.map(({ icon: Icon, problem, solution }, i) => (
            <motion.article
              key={problem}
              {...reveal}
              transition={{ ...reveal.transition, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-3xl bg-white p-7 ring-1 ring-ink-200/70 shadow-[var(--shadow-soft)]"
            >
              <div aria-hidden className="absolute -right-16 -top-16 size-48 rounded-full bg-gradient-to-br from-brand-100 to-saffron-100 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100" />
              <span className="relative grid size-12 place-items-center rounded-2xl bg-ink-900 text-white transition duration-500 group-hover:rotate-6 group-hover:bg-brand-600">
                <Icon className="size-6" aria-hidden />
              </span>
              <p className="relative mt-5 text-sm text-ink-400 line-through decoration-red-300">{problem}</p>
              <p className="relative mt-2 text-lg font-medium leading-snug text-ink-900">{solution}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Ruta de formalización con progreso ligado al scroll ---------- */
const route = [
  { icon: Sprout, name: "Registrado", text: "Registras tu negocio, en galería o en la calle, y apareces en el directorio." },
  { icon: Fingerprint, name: "Identificado", text: "Validas tu DNI: los compradores saben quién está detrás." },
  { icon: Landmark, name: "Con RUC", text: "Tu ficha RUC (RUS o RER) te permite emitir comprobantes y vender a empresas." },
  { icon: BadgeCheck, name: "Con licencia", text: "Con tu licencia municipal ganas la insignia destacada." },
  { icon: ShieldCheck, name: "Verificado", text: "Con trabajadores en planilla llegas al sello de empleador formal." },
];

export function RouteSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  return (
    <section className="relative overflow-hidden bg-ink-950 py-24 text-white">
      <div className="bg-weave-dark absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div {...reveal} className="max-w-2xl">
          <Eyebrow dark>Ruta de formalización</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Cinco niveles. Un paso a la vez. Cada uno con premio.</h2>
          <p className="mt-4 text-white/60">Subes tu documento, el gestor de tu galería lo valida en menos de 48 horas y tu insignia sube sola.</p>
        </motion.div>
        <div ref={ref} className="relative mt-16">
          <div className="absolute left-6 right-6 top-7 hidden h-0.5 bg-white/10 md:block" aria-hidden />
          <motion.div className="absolute left-6 top-7 hidden h-0.5 bg-gradient-to-r from-brand-400 via-saffron-400 to-mint-500 md:block" style={{ width }} aria-hidden />
          <ol className="grid gap-6 md:grid-cols-5">
            {route.map(({ icon: Icon, name, text }, i) => (
              <motion.li key={name} {...reveal} transition={{ ...reveal.transition, delay: i * 0.12 }} className="relative">
                <span className="relative z-10 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-saffron-500 shadow-[0_12px_30px_-10px_rgb(101_68_245/0.8)]">
                  <Icon className="size-6" aria-hidden />
                </span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-white/40">Nivel {i}</p>
                <p className="mt-1 text-lg font-semibold">{name}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{text}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ---------- Video ---------- */
export function VideoSection() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
        <motion.div {...reveal}>
          <Eyebrow>En 15 segundos</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-5xl">Así funciona, de punta a punta.</h2>
          <ul className="mt-6 flex flex-col gap-3 text-ink-600">
            {["Registras tu negocio y subes tus documentos.", "El gestor los verifica y tu insignia sube.", "Compradores te encuentran y cotizan por WhatsApp.", "Publicas empleos formales y eliges a tu equipo."].map((t, i) => (
              <li key={t} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">{i + 1}</span>
                {t}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div {...reveal} className="overflow-hidden rounded-3xl bg-ink-950 p-2 shadow-[0_40px_100px_-30px_rgb(22_20_31/0.5)] ring-1 ring-ink-200">
          <div className="flex items-center gap-1.5 px-3 py-2" aria-hidden>
            <span className="size-2.5 rounded-full bg-red-400" />
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="size-2.5 rounded-full bg-green-400" />
            <span className="ml-3 rounded-md bg-white/10 px-3 py-0.5 text-[11px] text-white/50">gamarraconecta.pe</span>
          </div>
          <video
            className="aspect-video w-full rounded-2xl"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/videos/gamarra-conecta-poster.jpg"
            aria-label="Video demostrativo: un emprendedor registra su negocio, sube su RUC, el gestor lo aprueba, recibe una cotización por WhatsApp y publica un empleo formal."
          >
            <source src="/videos/gamarra-conecta.webm" type="video/webm" />
            <source src="/videos/gamarra-conecta.mp4" type="video/mp4" />
          </video>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Para cada actor ---------- */
const audiences = [
  {
    key: "emprendedor",
    label: "Emprendedor",
    icon: Store,
    title: "Tu negocio, más visible a cada paso",
    points: ["Registro en galería o vía pública en 2 minutos", "Ruta de formalización con documentos privados", "Vitrina con precio por unidad y por docena", "Ofertas de empleo y gestión de postulantes"],
    cta: { href: "/registro?rol=emprendedor", label: "Registrar mi negocio" },
  },
  {
    key: "comprador",
    label: "Comprador",
    icon: ShoppingBag,
    title: "Proveedores confiables, sin dar vueltas",
    points: ["Busca por producto, categoría o galería", "Los negocios verificados aparecen primero", "Compara precio por unidad y por docena", "Cotiza por WhatsApp con un mensaje listo"],
    cta: { href: "/vitrina", label: "Explorar la vitrina" },
  },
  {
    key: "trabajador",
    label: "Trabajador",
    icon: Briefcase,
    title: "Empleo con reglas claras",
    points: ["Todas las ofertas pagan al menos la RMV", "Horario, contrato y vacantes visibles", "Postulas en un clic, una vez por oferta", "Sigues el estado de cada postulación"],
    cta: { href: "/empleos", label: "Ver empleos" },
  },
  {
    key: "gestor",
    label: "Gestor de galería",
    icon: ClipboardCheck,
    title: "Datos para formalizar con estrategia",
    points: ["Cola de verificación con documentos temporales", "Indicadores por galería y por nivel", "Registro de auditoría inmutable", "Reportes CSV para la municipalidad"],
    cta: { href: "/login", label: "Ingresar como gestor" },
  },
];

export function Audiences() {
  const [active, setActive] = useState(audiences[0].key);
  const a = audiences.find((x) => x.key === active) ?? audiences[0];
  return (
    <section className="bg-weave py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div {...reveal} className="mx-auto max-w-2xl text-center">
          <Eyebrow>Una plataforma, cuatro beneficiados</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-5xl">Hecha para todo el emporio.</h2>
        </motion.div>
        <div role="tablist" aria-label="Perfiles" className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2 rounded-2xl bg-white p-1.5 ring-1 ring-ink-200/70">
          {audiences.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              role="tab"
              aria-selected={active === key}
              onClick={() => setActive(key)}
              className={clsx("relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition", active === key ? "text-white" : "text-ink-600 hover:text-ink-900")}
            >
              {active === key && <motion.span layoutId="aud-pill" className="absolute inset-0 rounded-xl bg-ink-900" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
              <Icon className="relative size-4" aria-hidden />
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={a.key}
            role="tabpanel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="mx-auto mt-10 grid max-w-5xl items-center gap-10 rounded-3xl bg-white p-8 ring-1 ring-ink-200/70 shadow-[var(--shadow-soft)] md:grid-cols-[1fr_auto] md:p-12"
          >
            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">{a.title}</h3>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {a.points.map((p, i) => (
                  <motion.li key={p} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.07 }} className="flex items-start gap-2.5 text-ink-700">
                    <BadgeCheck className="mt-0.5 size-5 shrink-0 text-mint-600" aria-hidden /> {p}
                  </motion.li>
                ))}
              </ul>
            </div>
            <Link href={a.cta.href} className="group inline-flex h-12 items-center gap-2 justify-self-start rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white hover:bg-brand-700 md:justify-self-end">
              {a.cta.label} <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ---------- Impacto en vivo ---------- */
export function LiveImpact({ stats }: { stats: PublicStats }) {
  const pct = stats.negocios ? Math.round((stats.formalizados / stats.negocios) * 100) : 0;
  const items = [
    { icon: Store, value: stats.negocios, label: "Negocios en la plataforma" },
    { icon: TrendingUp, value: pct, suffix: "%", label: "Con RUC o más" },
    { icon: Building2, value: stats.galerias, label: "Galerías en el directorio" },
    { icon: Search, value: stats.productos, label: "Productos al por mayor" },
    { icon: Briefcase, value: stats.vacantes, label: "Vacantes formales abiertas" },
    { icon: Landmark, value: stats.sueldo_promedio, prefix: "S/ ", label: `Sueldo promedio (RMV S/ ${stats.rmv})` },
  ];
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div {...reveal} className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <Eyebrow>Impacto en vivo</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-5xl">Números que se actualizan solos.</h2>
          </div>
          <p className="flex items-center gap-2 text-sm text-ink-500">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-mint-500 opacity-70" />
              <span className="relative inline-flex size-2.5 rounded-full bg-mint-500" />
            </span>
            Datos en tiempo real de la base de datos
          </p>
        </motion.div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, value, suffix, prefix, label }, i) => (
            <motion.div key={label} {...reveal} transition={{ ...reveal.transition, delay: i * 0.06 }} className="flex items-center gap-5 rounded-3xl bg-white p-6 ring-1 ring-ink-200/70 shadow-[var(--shadow-soft)]">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-saffron-50 text-brand-600 ring-1 ring-brand-100">
                <Icon className="size-6" aria-hidden />
              </span>
              <div>
                <p className="text-3xl font-semibold tracking-tight text-ink-900">
                  <CountUp value={value} suffix={suffix} prefix={prefix} />
                </p>
                <p className="text-sm text-ink-500">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Seguridad ---------- */
const security = [
  { icon: FileLock2, title: "Documentos privados", text: "Tus archivos van a un almacenamiento privado y solo se abren con enlaces temporales." },
  { icon: Lock, title: "Acceso por rol", text: "Cada perfil ve solo lo suyo: la base de datos lo exige con seguridad a nivel de fila." },
  { icon: ScrollText, title: "Auditoría", text: "Cada verificación queda registrada con responsable y fecha, sin posibilidad de borrarla." },
  { icon: ShieldCheck, title: "DevSecOps", text: "Cada cambio pasa por análisis de código, secretos y dependencias antes de publicarse." },
];

export function SecuritySection() {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden bg-ink-950 py-24 text-white">
      <motion.div aria-hidden className="absolute left-1/2 top-1/2 size-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }}>
        <span className="absolute -top-1.5 left-1/2 size-3 rounded-full bg-saffron-400 shadow-[0_0_20px_4px_rgb(255_154_69/0.6)]" />
      </motion.div>
      <motion.div aria-hidden className="absolute left-1/2 top-1/2 size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" animate={reduce ? undefined : { rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}>
        <span className="absolute -bottom-1.5 left-1/2 size-3 rounded-full bg-brand-400 shadow-[0_0_20px_4px_rgb(130_104_255/0.6)]" />
      </motion.div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div {...reveal} className="mx-auto max-w-2xl text-center">
          <Eyebrow dark>Seguridad desde el diseño</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Tus datos, protegidos en cada capa.</h2>
        </motion.div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {security.map(({ icon: Icon, title, text }, i) => (
            <motion.div key={title} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }} className="rounded-3xl bg-white/[0.04] p-6 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/[0.07]">
              <Icon className="size-7 text-saffron-400" aria-hidden />
              <p className="mt-4 font-semibold">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Llamado final ---------- */
export function FinalCta() {
  return (
    <section className="bg-background px-4 py-24 sm:px-6">
      <motion.div {...reveal} className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-600 via-brand-700 to-ink-950 px-8 py-16 text-center text-white sm:px-16">
        <div className="bg-weave-dark absolute inset-0 opacity-50" aria-hidden />
        {[...Array(14)].map((_, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="absolute size-1.5 rounded-full bg-saffron-300"
            style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }}
            animate={{ y: [0, -24, 0], opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
        <h2 className="relative mx-auto max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">Tu próximo cliente ya está buscando en Gamarra Conecta.</h2>
        <p className="relative mx-auto mt-4 max-w-xl text-white/70">Registrarte es gratis. Empieza en el nivel 0 y sube a tu ritmo.</p>
        <div className="relative mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/registro?rol=emprendedor" className="inline-flex h-12 items-center gap-2 rounded-xl bg-saffron-500 px-6 text-sm font-semibold text-ink-950 hover:bg-saffron-400">
            Registrar mi negocio <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link href="/vitrina" className="inline-flex h-12 items-center gap-2 rounded-xl bg-white/10 px-6 text-sm font-semibold text-white ring-1 ring-white/25 hover:bg-white/15">
            <MessageCircle className="size-4" aria-hidden /> Cotizar con proveedores
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
