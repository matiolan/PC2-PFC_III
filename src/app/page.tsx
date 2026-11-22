import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero, type PublicStats } from "@/components/landing/hero";
import { Audiences, FinalCta, LiveImpact, Marquee, ProblemSolution, RouteSection, SecuritySection, VideoSection } from "@/components/landing/sections";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, DEFAULT_RMV } from "@/lib/domain";

export const metadata: Metadata = {
  title: "Gamarra Conecta · Formalízate paso a paso y vende más",
};

const EMPTY: PublicStats = { negocios: 0, formalizados: 0, galerias: 0, productos: 0, ofertas: 0, vacantes: 0, sueldo_promedio: 0, rmv: DEFAULT_RMV };

/** HU20: landing animada con indicadores en vivo. */
export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: stats }, { data: galleries }] = await Promise.all([
    supabase.rpc("public_stats"),
    supabase.from("galleries").select("name").order("name"),
  ]);
  const s = { ...EMPTY, ...((stats as unknown as PublicStats) ?? {}) };
  const marquee = [...(galleries ?? []).map((g) => g.name), ...CATEGORIES, "Vía pública", "Empleo formal", "Cotización por WhatsApp"];

  return (
    <>
      <SiteHeader dark />
      <main>
        <Hero stats={s} />
        <Marquee items={marquee} />
        <ProblemSolution />
        <RouteSection />
        <VideoSection />
        <Audiences />
        <LiveImpact stats={s} />
        <SecuritySection />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
