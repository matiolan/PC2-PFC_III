"use client";

import { motion, useReducedMotion } from "motion/react";

const checks = [
  { label: "CI · lint · types · tests · build", tone: "from-emerald-400 to-teal-300" },
  { label: "Seguridad · CodeQL · Gitleaks · deps", tone: "from-sky-400 to-indigo-300" },
  { label: "Supabase · Auth · RLS", tone: "from-emerald-300 to-lime-200" },
  { label: "Vercel · preview por PR", tone: "from-fuchsia-400 to-violet-300" },
];

export function BootHero() {
  const reduce = useReducedMotion();

  return (
    <main className="relative isolate flex min-h-screen flex-1 items-center justify-center overflow-hidden px-6">
      {/* Cuadrícula de fondo */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.15] [background-image:linear-gradient(to_right,#ffffff14_1px,transparent_1px),linear-gradient(to_bottom,#ffffff14_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />

      {/* Orbes animados */}
      {[
        "left-[10%] top-[15%] bg-indigo-600/40",
        "right-[8%] top-[30%] bg-fuchsia-600/30",
        "left-[35%] bottom-[5%] bg-emerald-500/25",
      ].map((cls, i) => (
        <motion.div
          key={cls}
          aria-hidden
          className={`absolute -z-10 size-[28rem] rounded-full blur-3xl ${cls}`}
          animate={reduce ? undefined : { x: [0, 40, -30, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 18 + i * 4, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <section className="mx-auto max-w-3xl text-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-xs tracking-wider text-white/70 backdrop-blur"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          PIPELINE ACTIVO
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 bg-gradient-to-b from-white to-white/50 bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-7xl"
        >
          PC2-PFC_III
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mx-auto mt-6 max-w-xl text-balance text-lg text-white/60"
        >
          Infraestructura lista. El producto se está construyendo sprint a sprint.
        </motion.p>

        <ul className="mx-auto mt-12 grid max-w-2xl gap-3 sm:grid-cols-2">
          {checks.map((c, i) => (
            <motion.li
              key={c.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.12 }}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-white/80 backdrop-blur"
            >
              <motion.span
                aria-hidden
                className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${c.tone}`}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.6, delay: 0.7 + i * 0.12 }}
              />
              <span className="font-mono">{c.label}</span>
            </motion.li>
          ))}
        </ul>
      </section>
    </main>
  );
}
