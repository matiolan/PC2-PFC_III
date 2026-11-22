"use client";

import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { ArrowRight, BadgeCheck, Briefcase, Check, MessageCircle, ShieldCheck, Sparkles, Store } from "lucide-react";
import { CountUp } from "./count-up";

export type PublicStats = {
  negocios: number;
  formalizados: number;
  galerias: number;
  productos: number;
  ofertas: number;
  vacantes: number;
  sueldo_promedio: number;
  rmv: number;
};

const words = ["Formalízate", "paso", "a", "paso."];

export function Hero({ stats }: { stats: PublicStats }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const rotY = useTransform(sx, [-0.5, 0.5], [8, -8]);
  const rotX = useTransform(sy, [-0.5, 0.5], [-6, 6]);
  const floatA = useTransform(sx, [-0.5, 0.5], [-18, 18]);
  const floatB = useTransform(sy, [-0.5, 0.5], [14, -14]);
  const pct = stats.negocios ? Math.round((stats.formalizados / stats.negocios) * 100) : 0;

  return (
    <section
      className="relative isolate overflow-hidden bg-ink-950 text-white"
      onMouseMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
    >
      <div className="bg-weave-dark absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" aria-hidden />
      <motion.div aria-hidden className="absolute -left-40 top-10 -z-10 size-[36rem] rounded-full bg-brand-600/40 blur-[120px]" animate={reduce ? undefined : { x: [0, 80, 0], y: [0, 40, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div aria-hidden className="absolute -right-32 bottom-0 -z-10 size-[30rem] rounded-full bg-saffron-500/25 blur-[120px]" animate={reduce ? undefined : { x: [0, -60, 0], y: [0, -30, 0] }} transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }} />

      {/* Hilo que se cose a lo largo del hero */}
      <svg aria-hidden className="absolute inset-x-0 top-24 -z-10 h-[520px] w-full opacity-60" viewBox="0 0 1440 520" preserveAspectRatio="none" fill="none">
        <motion.path
          d="M-20 380 C 220 120, 420 520, 700 300 S 1180 60, 1460 220"
          stroke="url(#thread)"
          strokeWidth="2"
          strokeDasharray="10 10"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3.2, ease: "easeInOut", delay: 0.3 }}
        />
        <defs>
          <linearGradient id="thread" x1="0" x2="1">
            <stop offset="0" stopColor="#8268ff" stopOpacity="0" />
            <stop offset=".5" stopColor="#ff9a45" />
            <stop offset="1" stopColor="#8268ff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-24">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/80 ring-1 ring-white/15 backdrop-blur"
          >
            <Sparkles className="size-3.5 text-saffron-400" aria-hidden /> Gamarra, La Victoria · formalización progresiva
          </motion.p>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.1rem] xl:text-7xl">
            <span className="sr-only">Formalízate paso a paso y vende más desde hoy.</span>
            <span aria-hidden>
              {words.map((w, i) => (
                <motion.span
                  key={w + i}
                  className="mr-[0.25em] inline-block"
                  initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}
                </motion.span>
              ))}
              <br />
              <motion.span
                className="text-gradient inline-block"
                initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
              >
                Vende más desde hoy.
              </motion.span>
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/65"
          >
            Gamarra Conecta une a los negocios de galerías y de la calle con compradores mayoristas y trabajadores. Cada paso que das hacia la
            formalidad sube tu insignia y te pone primero en la vitrina.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15 }} className="mt-9 flex flex-wrap gap-3">
            <Link href="/registro?rol=emprendedor" className="group inline-flex h-12 items-center gap-2 rounded-xl bg-saffron-500 px-6 text-sm font-semibold text-ink-950 shadow-[0_12px_30px_-10px_rgb(255_122_26/0.8)] transition hover:bg-saffron-400">
              Registrar mi negocio gratis <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
            </Link>
            <Link href="/vitrina" className="inline-flex h-12 items-center gap-2 rounded-xl bg-white/10 px-6 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/15">
              <Store className="size-4" aria-hidden /> Busco proveedores
            </Link>
            <Link href="/empleos" className="inline-flex h-12 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white/80 transition hover:text-white">
              <Briefcase className="size-4" aria-hidden /> Busco empleo
            </Link>
          </motion.div>
          <motion.dl initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.35 }} className="mt-12 grid max-w-xl grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { v: stats.negocios, l: "negocios" },
              { v: pct, l: "con RUC o más", s: "%" },
              { v: stats.productos, l: "productos" },
              { v: stats.vacantes, l: "vacantes formales" },
            ].map((x) => (
              <div key={x.l}>
                <dt className="sr-only">{x.l}</dt>
                <dd className="text-3xl font-semibold tracking-tight">
                  <CountUp value={x.v} suffix={x.s} />
                </dd>
                <p className="mt-1 text-xs text-white/50" aria-hidden>{x.l}</p>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Collage animado de la aplicación */}
        <div className="relative mx-auto h-[540px] w-full max-w-[520px] [perspective:1400px]">
          <motion.div
            style={reduce ? undefined : { rotateY: rotY, rotateX: rotX }}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-8 top-6 rounded-[2rem] bg-white p-5 text-ink-900 shadow-[0_40px_120px_-30px_rgb(101_68_245/0.6)] ring-1 ring-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-500">Mi negocio</p>
                <p className="font-semibold">Pima Andina</p>
              </div>
              <span className="relative inline-flex items-center gap-1 overflow-hidden rounded-full bg-gradient-to-r from-saffron-50 to-amber-50 px-3 py-1 text-xs font-semibold text-saffron-600 ring-1 ring-saffron-300">
                <span className="animate-shimmer absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgb(255_255_255/0.8)_50%,transparent_70%)] bg-[length:200%_100%]" />
                <ShieldCheck className="relative size-3.5" aria-hidden /> <span className="relative">Verificado</span>
              </span>
            </div>
            <p className="mt-5 text-xs font-medium uppercase tracking-wider text-ink-400">Ruta de formalización</p>
            <div className="mt-3 flex flex-col gap-2.5">
              {["Registrado", "DNI del titular", "Ficha RUC", "Licencia municipal", "Trabajadores en planilla"].map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.35 }}
                  className="flex items-center gap-3 rounded-xl bg-ink-50 px-3 py-2.5 ring-1 ring-ink-100"
                >
                  <motion.span
                    className="grid size-6 place-items-center rounded-full text-white"
                    initial={{ backgroundColor: "#dcdae3" }}
                    animate={{ backgroundColor: "#10a88c" }}
                    transition={{ delay: 1.2 + i * 0.35 }}
                  >
                    <Check className="size-3.5" aria-hidden />
                  </motion.span>
                  <span className="text-sm font-medium text-ink-800">{step}</span>
                  <span className="ml-auto text-[11px] text-ink-400">Nivel {i}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink-100">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-saffron-500" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ delay: 1.1, duration: 1.9, ease: "easeInOut" }} />
            </div>
          </motion.div>

          <motion.div
            style={reduce ? undefined : { x: floatA }}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 2.4, type: "spring", stiffness: 160, damping: 14 }}
            className="absolute -left-2 bottom-0 w-64 rounded-2xl bg-[#e7ffdb] p-3.5 text-ink-900 shadow-2xl ring-1 ring-black/5 sm:-left-10"
          >
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#146c36]">
              <MessageCircle className="size-3.5" aria-hidden /> WhatsApp · cotización
            </p>
            <p className="mt-1.5 text-sm leading-snug">Hola Pima Andina, quisiera cotizar 48 unidades de «Polo pima 30/1» 👕</p>
            <p className="mt-1 text-right text-[10px] text-ink-500">10:42 ✓✓</p>
          </motion.div>

          <motion.div
            style={reduce ? undefined : { y: floatB }}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 2.8, type: "spring", stiffness: 160, damping: 14 }}
            className="absolute -right-2 -bottom-10 w-60 rounded-2xl bg-ink-900 p-4 text-white shadow-2xl ring-1 ring-white/10 sm:-right-8"
          >
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-saffron-300">
              <Briefcase className="size-3.5" aria-hidden /> Nueva oferta formal
            </p>
            <p className="mt-1.5 font-semibold">Operaria de remalladora</p>
            <p className="text-xs text-white/60">Plazo indeterminado · L-S 8 a 17</p>
            <p className="mt-2 text-lg font-semibold text-mint-500">S/ 1,500.00</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={reduce ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, -10, 0] }}
            transition={{ delay: 3.1, y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
            className="absolute -top-2 right-0 flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur sm:-right-6"
          >
            <BadgeCheck className="size-4 text-mint-500" aria-hidden /> RUC aprobado por el gestor
          </motion.div>
        </div>
      </div>
    </section>
  );
}
