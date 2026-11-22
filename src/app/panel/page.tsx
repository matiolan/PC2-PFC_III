import type { Metadata } from "next";
import { Alert, PageHeader } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { ROLE_INFO } from "@/lib/domain";

export const metadata: Metadata = { title: "Mi panel · Gamarra Conecta" };

export default async function PanelPage({ searchParams }: PageProps<"/panel">) {
  const { profile } = await requireSession();
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
      <PageHeader eyebrow={ROLE_INFO[profile.role].label} title={`Hola, ${firstName}`} description={ROLE_INFO[profile.role].description} />
    </div>
  );
}
