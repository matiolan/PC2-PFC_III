"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  BarChart3,
  BadgeCheck,
  Briefcase,
  ClipboardCheck,
  Home,
  Package,
  ScrollText,
  Search,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { NavItem } from "@/components/panel-nav";

const ICONS: Record<string, LucideIcon> = {
  home: Home,
  store: Store,
  route: BadgeCheck,
  package: Package,
  briefcase: Briefcase,
  users: Users,
  search: Search,
  check: ClipboardCheck,
  chart: BarChart3,
  log: ScrollText,
};

export function PanelSidebar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Panel" className="flex gap-1 overflow-x-auto lg:flex-col">
      {items.map((item) => {
        const Icon = ICONS[item.icon] ?? Home;
        const active = item.href === "/panel" ? pathname === "/panel" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active ? "bg-white text-brand-700 shadow-[var(--shadow-soft)] ring-1 ring-ink-200/70" : "text-ink-600 hover:bg-white/70 hover:text-ink-900",
            )}
          >
            <Icon className={clsx("size-4", active ? "text-brand-600" : "text-ink-400")} aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
