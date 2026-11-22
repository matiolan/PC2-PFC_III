import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Briefcase, ClipboardCheck, Store } from "lucide-react";
import { Alert, ButtonLink, Card, PageHeader } from "@/components/ui";
import { requireSession, type Session } from "@/lib/auth";
import { LevelBadge } from "@/components/level-badge";
import { CopyButton } from "@/components/copy-button";
import { createClient } from "@/lib/supabase/server";
import { formalizationPercent, levelInfo, ROLE_INFO } from "@/lib/domain";

export const metadata: Metadata = { title: "Mi panel · Gamarra Conecta" };

export default async function PanelPage({ searchParams }: PageProps<"/panel">) {
  const session = await requireSession();
  const { profile } = session;
  const sp = await searchParams;
  const firstName = profile.full_name?.split(" ")[0] ?? "";

  return (
    <div className="flex flex-col gap-6">
      {sp.bienvenida && (
        <Alert tone="success" title={`¡Bienvenido(a), ${firstName}!`}>
          Tu cuenta de {ROLE_INFO[profile.role].label.toLowerCase()} está lista.
        </Alert>
      )}
      {sp.acceso === "denegado" && (
        <Alert tone="error" title="Acceso restringido">
          Esa sección no está disponible para tu rol.
        </Alert>
      )}
      {sp.clave === "actualizada" && <Alert tone="success">Tu contraseña se actualizó correctamente.</Alert>}
      <PageHeader
        eyebrow={ROLE_INFO[profile.role].label}
        title={`Hola, ${firstName}`}
        description={ROLE_INFO[profile.role].description}
      />
      {profile.role === "emprendedor" && <EntrepreneurSummary session={session} />}
      {profile.role === "gestor" && <ManagerSummary />}
      {profile.role === "trabajador" && <QuickLink href="/empleos" icon={<Briefcase className="size-5" />} title="Busca empleos formales" text="Todas las ofertas muestran sueldo, horario y contrato, y respetan la remuneración mínima." />}
      {profile.role === "comprador" && <QuickLink href="/vitrina" icon={<Store className="size-5" />} title="Explora la vitrina mayorista" text="Compara precios por unidad y por docena y cotiza por WhatsApp con proveedores verificados." />}
    </div>
  );
}

async function EntrepreneurSummary({ session }: { session: Session }) {
  const supabase = await createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, level, slug")
    .eq("owner_id", session.userId)
    .maybeSingle();

  if (!business) {
    return (
      <Card className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <Store className="size-6" aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-ink-900">Registra tu negocio para empezar</p>
            <p className="text-sm text-ink-500">Toma menos de 2 minutos y apareces de inmediato en el directorio.</p>
          </div>
        </div>
        <ButtonLink href="/panel/negocio">
          Registrar negocio <ArrowRight className="size-4" />
        </ButtonLink>
      </Card>
    );
  }

  const info = levelInfo(business.level);
  const next = business.level < 4 ? levelInfo(business.level + 1) : null;
  const percent = formalizationPercent(business.level);
  return (
    <Card className="overflow-hidden">
      <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-sm text-ink-500">{business.name}</p>
          <p className="mt-1 flex items-center gap-2 text-xl font-semibold text-ink-900">
            <BadgeCheck className="size-5 text-brand-600" aria-hidden /> Nivel {info.level} · {info.name}
          </p>
          <div className="mt-3 h-2 max-w-md overflow-hidden rounded-full bg-ink-100">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-saffron-500" style={{ width: `${percent}%` }} />
          </div>
          {next && (
            <p className="mt-3 text-sm text-ink-600">
              Próximo paso: <strong>{next.docLabel}</strong> para llegar a «{next.name}».
            </p>
          )}
        </div>
        <ButtonLink href="/panel/formalizacion" variant="secondary">
          Ver mi ruta <ArrowRight className="size-4" />
        </ButtonLink>
      </div>
      <div className="grid gap-5 border-t border-ink-100 bg-ink-50/60 p-6 md:grid-cols-[auto_1fr] md:items-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG dinámico generado por la app */}
        <img
          src={`/insignia/${business.slug}`}
          alt={`Insignia de ${business.name}: nivel ${info.level}, ${info.name}`}
          width={252}
          height={108}
          className="rounded-xl shadow-[var(--shadow-soft)]"
        />
        <div>
          <p className="flex items-center gap-2 font-semibold text-ink-900">
            Tu insignia <LevelBadge level={business.level} />
          </p>
          <p className="mt-1 text-sm text-ink-500">
            Aparece en tu ficha y en la vitrina. Compártela en tus redes o imprímela para tu stand: se actualiza sola cuando subes de nivel.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyButton text={`/insignia/${business.slug}`} label="Copiar enlace de la insignia" />
            <ButtonLink href={`/insignia/${business.slug}`} variant="ghost" size="sm" target="_blank">
              Abrir
            </ButtonLink>
          </div>
        </div>
      </div>
    </Card>
  );
}

async function ManagerSummary() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("formalization_evidence")
    .select("id", { count: "exact", head: true })
    .eq("status", "pendiente");
  return (
    <QuickLink
      href="/panel/verificaciones"
      icon={<ClipboardCheck className="size-5" />}
      title={`${count ?? 0} evidencia(s) por revisar`}
      text="Aprueba u observa los documentos para que cada negocio avance en su ruta."
    />
  );
}

function QuickLink({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link href={href} className="group">
      <Card className="flex items-center gap-4 p-6 transition group-hover:shadow-[var(--shadow-lift)] group-hover:ring-brand-200">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">{icon}</span>
        <div className="flex-1">
          <p className="font-semibold text-ink-900">{title}</p>
          <p className="text-sm text-ink-500">{text}</p>
        </div>
        <ArrowRight className="size-5 text-ink-300 transition group-hover:translate-x-1 group-hover:text-brand-600" aria-hidden />
      </Card>
    </Link>
  );
}
