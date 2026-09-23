import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  Crown,
  FileText,
  Home,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Brand } from "./brand";
import { Button } from "@/components/ui/button";
import { PlanBadge } from "@/components/plan-badge";
import { useWorkspace } from "@/lib/workspace-state";

const primaryItems = [
  { label: "Dashboard", to: "/dashboard" as const, icon: LayoutDashboard },
  { label: "Suche", to: "/marketplace" as const, icon: Search },
  { label: "Meine Aufträge", to: "/meine-auftraege" as const, icon: BriefcaseBusiness },
  { label: "Matches", to: "/matches" as const, icon: Sparkles },
  { label: "Nachrichten", to: "/nachrichten" as const, icon: MessageSquare },
];

const secondaryItems = [
  { label: "Bewerbungen", to: "/bewerbungen" as const, icon: FileText },
  { label: "Gespeichert", to: "/gespeichert" as const, icon: Bookmark },
  { label: "Benachrichtigungen", to: "/benachrichtigungen" as const, icon: Bell },
  { label: "Mitgliedschaft", to: "/mitgliedschaft" as const, icon: Crown },
  { label: "Profil", to: "/profil" as const, icon: UserRound },
];

const mobileItems = [
  { label: "Start", to: "/dashboard" as const, icon: Home },
  { label: "Suche", to: "/marketplace" as const, icon: Search },
  { label: "Chat", to: "/nachrichten" as const, icon: MessageSquare },
  { label: "Profil", to: "/profil" as const, icon: UserRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { unreadCount } = useWorkspace();

  const navItem = ({ label, to, icon: Icon }: (typeof primaryItems)[number] | (typeof secondaryItems)[number]) => {
    const active = pathname === to;
    return (
      <Link
        key={to}
        to={to}
        className={`group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-all ${active ? "bg-white text-brand-dark shadow-lg shadow-black/10" : "text-white/58 hover:bg-white/8 hover:text-white"}`}
      >
        <span className={`grid size-8 place-items-center rounded-lg transition-colors ${active ? "bg-primary/12 text-primary" : "bg-white/[0.04] text-white/55 group-hover:text-white"}`}>
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {label === "Benachrichtigungen" && unreadCount > 0 ? (
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-brand-dark">{unreadCount}</span>
        ) : active ? (
          <ChevronRight className="size-3.5 text-muted-foreground" />
        ) : null}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-muted/35">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[18rem] overflow-hidden bg-brand-dark text-white lg:flex lg:flex-col">
        <div className="bausqo-grid-dark absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute -left-28 top-10 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex h-[82px] items-center border-b border-white/10 px-5">
          <Brand inverse />
        </div>

        <div className="relative mx-4 mt-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
              <Building2 className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/35">Workspace</p>
              <p className="mt-0.5 truncate text-sm font-black">Rheinbau Projekt GmbH</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-white/[0.045] px-3 py-2">
            <span className="text-[10px] font-bold text-white/45">Mitgliedschaft</span>
            <PlanBadge plan="BUSINESS" compact />
          </div>
        </div>

        <div className="relative mt-4 flex-1 overflow-y-auto px-3 pb-4">
          <p className="px-3 pb-2 text-[9px] font-black uppercase tracking-[0.16em] text-white/25">Arbeitsbereich</p>
          <nav className="space-y-1">{primaryItems.map(navItem)}</nav>

          <div className="my-4 h-px bg-white/8" />
          <p className="px-3 pb-2 text-[9px] font-black uppercase tracking-[0.16em] text-white/25">Verwalten</p>
          <nav className="space-y-1">{secondaryItems.map(navItem)}</nav>

          <div className="mt-1 flex h-11 items-center gap-3 px-3 text-sm font-semibold text-white/25">
            <span className="grid size-8 place-items-center rounded-lg bg-white/[0.03]"><Settings className="size-4" /></span>
            Einstellungen
            <span className="ml-auto text-[8px] font-black uppercase tracking-[0.12em]">bald</span>
          </div>
        </div>

        <div className="relative border-t border-white/10 p-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white/60">
              <span className="bausqo-live size-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,.08)]" />
              System aktiv
            </div>
            <p className="mt-1 text-[10px] leading-4 text-white/30">Aufträge, Nachrichten und Matches sind verbunden.</p>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-[74px] items-center border-b bg-background/88 px-4 backdrop-blur-xl lg:ml-[18rem] lg:px-6">
        <div className="lg:hidden"><Brand /></div>

        <button
          type="button"
          className="ml-6 hidden h-11 w-full max-w-xl items-center gap-3 rounded-2xl border bg-card/80 px-4 text-left text-sm text-muted-foreground shadow-sm transition-all hover:border-primary/30 hover:shadow-md lg:flex"
          onClick={() => { window.location.href = "/marketplace"; }}
        >
          <Search className="size-4 text-primary" />
          <span className="flex-1">Aufträge, Firmen, Gewerke oder Orte suchen…</span>
          <span className="rounded-lg border bg-muted/60 px-2 py-1 text-[10px] font-bold">⌘ K</span>
        </button>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild className="hidden rounded-xl lg:flex">
            <Link to="/auftrag/erstellen" search={{ draft: undefined }}>
              <Plus className="size-4" />
              Auftrag erstellen
            </Link>
          </Button>
          <Button asChild variant="outline" size="icon" className="relative rounded-xl bg-card">
            <Link to="/benachrichtigungen" aria-label="Benachrichtigungen">
              <Bell className="size-4" />
              {unreadCount > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />}
            </Link>
          </Button>
          <Link
            to="/profil"
            aria-label="Profil"
            className="grid size-10 place-items-center rounded-xl border bg-card text-xs font-black text-primary shadow-sm"
          >
            RB
          </Link>
        </div>
      </header>

      <main className="pb-28 lg:ml-[18rem] lg:pb-8">{children}</main>

      <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 items-end rounded-[1.4rem] border bg-background/94 px-1 pb-[max(env(safe-area-inset-bottom),4px)] shadow-[0_16px_50px_rgba(15,23,42,.20)] backdrop-blur-xl lg:hidden">
        <Link
          to={mobileItems[0].to}
          className={`flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-bold ${pathname === mobileItems[0].to ? "text-primary" : "text-muted-foreground"}`}
        >
          <Home className="size-5" />Start
        </Link>
        <Link
          to={mobileItems[1].to}
          className={`flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-bold ${pathname === mobileItems[1].to ? "text-primary" : "text-muted-foreground"}`}
        >
          <Search className="size-5" />Suche
        </Link>
        <Link
          to="/auftrag/erstellen"
          search={{ draft: undefined }}
          aria-label="Auftrag erstellen"
          className="-mt-5 mx-auto grid size-16 place-items-center rounded-2xl bg-primary text-brand-dark shadow-[0_14px_34px_rgba(45,212,191,.32)]"
        >
          <Plus className="size-8" />
        </Link>
        <Link
          to={mobileItems[2].to}
          className={`flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-bold ${pathname === mobileItems[2].to ? "text-primary" : "text-muted-foreground"}`}
        >
          <MessageSquare className="size-5" />Chat
        </Link>
        <Link
          to={mobileItems[3].to}
          className={`flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-bold ${pathname === mobileItems[3].to ? "text-primary" : "text-muted-foreground"}`}
        >
          <UserRound className="size-5" />Profil
        </Link>
      </nav>
    </div>
  );
}
