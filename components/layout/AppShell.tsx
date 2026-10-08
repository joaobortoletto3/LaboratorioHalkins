"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { HawkinsLogo } from "@/components/hawkins/HawkinsLogo";
import { SoundToggle } from "@/components/hawkins/SoundToggle";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function AppShell({
  nav,
  roleLabel,
  onSignOut,
  sidebarExtra,
  corruption = 0,
  demo,
  children,
}: {
  nav: NavItem[];
  roleLabel: string;
  onSignOut: () => void;
  sidebarExtra?: React.ReactNode;
  corruption?: number;
  demo?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const level = corruption >= 0.8 ? 3 : corruption >= 0.5 ? 2 : corruption > 0 ? 1 : 0;

  const NavList = (
    <nav className="flex flex-col gap-1 px-3" aria-label="Menu principal">
      {nav.map((item) => {
        const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex min-h-11 items-center gap-3 rounded-xl border px-3 py-3 font-sans text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flare",
              active ? "border-blood/30 bg-blood/15 text-bone" : "border-transparent text-ash hover:bg-bone/5 hover:text-bone",
            )}
          >
            <Icon className={cn("h-4 w-4", active ? "text-flare" : "text-ash group-hover:text-flare")} />
            {item.label}
          </Link>
        );
      })}
      <button
        onClick={onSignOut}
        className="mt-3 flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-ash transition hover:bg-bone/5 hover:text-flare"
      >
        <LogOut className="h-4 w-4" /> Sair
      </button>
    </nav>
  );

  return (
    <div data-corruption={level} className="app-bg relative min-h-screen bg-void">

      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-bone/10 bg-abyss/95 lg:flex">
        <div className="sidebar-brand border-b border-bone/10 px-6 py-8 text-center">
          <Link href={nav[0]?.href ?? "/"} className="inline-block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-flare" aria-label="Laboratório Hawkins — início">
            <HawkinsLogo size="md" />
          </Link>
          <p className="mt-3 text-center font-mono text-[9px] tracking-[0.3em] text-ash">{roleLabel}</p>
        </div>
        {sidebarExtra && <div className="border-b border-bone/10 p-4">{sidebarExtra}</div>}
        <div className="flex-1 overflow-y-auto py-4">{NavList}</div>
        <div className="flex items-center justify-between gap-2 border-t border-bone/10 p-4">
          <SoundToggle />
          {demo && <span className="font-mono text-[9px] tracking-[0.2em] text-alert">MODO DEMO</span>}
        </div>
      </aside>

      {/* Topbar mobile */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-bone/10 bg-abyss/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link href={nav[0]?.href ?? "/"}>
          <HawkinsLogo size="md" />
        </Link>
        <button onClick={() => setOpen(true)} aria-label="Abrir menu" className="border border-bone/15 p-2 text-bone">
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Drawer mobile */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-void/80 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside
              className="fixed inset-y-0 right-0 z-50 flex w-[82%] max-w-xs flex-col border-l border-blood/30 bg-abyss lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
            >
              <div className="flex items-center justify-between border-b border-bone/10 p-4">
                <span className="font-mono text-[10px] tracking-[0.3em] text-ash">{roleLabel}</span>
                <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="p-1 text-bone">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {sidebarExtra && <div className="border-b border-bone/10 p-4">{sidebarExtra}</div>}
              <div className="flex-1 overflow-y-auto py-3">{NavList}</div>
              <div className="flex items-center justify-between border-t border-bone/10 p-4">
                <SoundToggle />
                {demo && <span className="font-mono text-[9px] tracking-[0.2em] text-alert">MODO DEMO</span>}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="relative z-10 lg:pl-72">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-8 sm:py-8 xl:px-10">{children}</div>
      </main>
    </div>
  );
}
