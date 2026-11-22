"use client";

import { motion } from "motion/react";
import { BadgeCheck, MessageCircle, Store, Users } from "lucide-react";
import { Logo } from "@/components/logo";

const steps = [
  { n: 0, label: "Registrado" },
  { n: 1, label: "Con DNI" },
  { n: 2, label: "Con RUC" },
  { n: 3, label: "Licencia" },
  { n: 4, label: "Verificado" },
];

/** Panel lateral animado de las pantallas de acceso. */
export function AuthShowcase() {
  return (
    <aside className="relative hidden overflow-hidden bg-ink-950 p-10 text-white lg:flex lg:flex-col">
      <div className="bg-weave-dark absolute inset-0" aria-hidden />
      <motion.div
        aria-hidden
        className="absolute -left-32 top-1/4 size-[28rem] rounded-full bg-brand-600/40 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -right-24 bottom-10 size-80 rounded-full bg-saffron-500/30 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative">
        <Logo dark />
      </div>

      <div className="relative mt-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md text-4xl font-semibold leading-tight tracking-tight"
        >
          Formalizarte ahora <span className="text-gradient">te trae más clientes.</span>
        </motion.h2>
        <p className="mt-4 max-w-md text-white/60">
          Cada paso de tu ruta de formalización sube tu insignia y te acerca a los primeros lugares de la vitrina.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-10 rounded-2xl bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-white/50">Ruta de formalización</p>
          <div className="relative mt-5 flex justify-between">
            <div className="absolute left-4 right-4 top-4 h-0.5 bg-white/10" />
            <motion.div
              className="absolute left-4 top-4 h-0.5 bg-gradient-to-r from-brand-400 to-saffron-400"
              initial={{ width: 0 }}
              animate={{ width: "calc(75% - 2rem)" }}
              transition={{ duration: 2.2, delay: 0.6, ease: "easeInOut" }}
            />
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                className="relative flex flex-col items-center gap-2"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.45 }}
              >
                <span
                  className={`grid size-8 place-items-center rounded-full text-xs font-bold ${
                    i <= 3 ? "bg-gradient-to-br from-brand-500 to-saffron-500 text-white" : "bg-white/10 text-white/50"
                  }`}
                >
                  {s.n}
                </span>
                <span className="text-[11px] text-white/60">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
          {[
            { icon: Store, text: "Vitrina mayorista" },
            { icon: MessageCircle, text: "Cotiza por WhatsApp" },
            { icon: Users, text: "Empleo formal" },
          ].map(({ icon: Icon, text }, i) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.15 }}
              className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2.5 text-white/70 ring-1 ring-white/10"
            >
              <Icon className="size-4 text-saffron-400" aria-hidden /> {text}
            </motion.div>
          ))}
        </div>
        <p className="mt-8 flex items-center gap-2 text-xs text-white/40">
          <BadgeCheck className="size-4" aria-hidden /> Tus documentos se guardan cifrados y solo los ve el gestor de tu
          galería.
        </p>
      </div>
    </aside>
  );
}
