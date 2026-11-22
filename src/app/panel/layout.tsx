import { LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { PanelSidebar } from "@/components/panel-sidebar";
import { PANEL_NAV } from "@/components/panel-nav";
import { Badge } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { ROLE_INFO } from "@/lib/domain";
import { signOutAction } from "@/app/(auth)/actions";

export default async function PanelLayout({ children }: LayoutProps<"/panel">) {
  const session = await requireSession();
  const { profile } = session;
  const initials = (profile.full_name ?? session.email)
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div className="bg-weave min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-ink-200/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-ink-900">{profile.full_name ?? session.email}</p>
              <Badge tone="brand" className="mt-0.5">
                {ROLE_INFO[profile.role].label}
              </Badge>
            </div>
            <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-saffron-500 text-sm font-semibold text-white">
              {initials}
            </span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="grid size-9 place-items-center rounded-xl text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr] lg:py-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <PanelSidebar items={PANEL_NAV[profile.role]} />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
