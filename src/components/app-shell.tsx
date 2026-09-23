import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  FileText,
  Home,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Brand } from "./brand";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/lib/workspace-state";

const items = [
  { label: "Dashboard", to: "/dashboard" as const, icon: LayoutDashboard },
  { label: "Suche", to: "/marketplace" as const, icon: Search },
  { label: "Meine Aufträge", to: "/meine-auftraege" as const, icon: BriefcaseBusiness },
  { label: "Matches", to: "/matches" as const, icon: Sparkles },
  { label: "Nachrichten", to: "/nachrichten" as const, icon: MessageSquare },
  { label: "Bewerbungen", to: "/bewerbungen" as const, icon: FileText },
  { label: "Gespeichert", to: "/gespeichert" as const, icon: Bookmark },
  { label: "Benachrichtigungen", to: "/benachrichtigungen" as const, icon: Bell },
  { label: "Profil", to: "/profil" as const, icon: UserRound },
];

const future = [{ label: "Einstellungen", icon: Settings }];

const mobileItems = [
  { label: "Start", to: "/dashboard" as const, icon: Home },
  { label: "Suche", to: "/marketplace" as const, icon: Search },
  { label: "Aufträge", to: "/meine-auftraege" as const, icon: BriefcaseBusiness },
  { label: "Chat", to: "/nachrichten" as const, icon: MessageSquare },
  { label: "Profil", to: "/profil" as const, icon: UserRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { unreadCount } = useWorkspace();

  return (
    <div className="min-h-screen bg-muted/45">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[17.5rem] border-r border-primary-foreground/10 bg-brand-dark text-primary-foreground lg:flex lg:flex-col">
        <div className="flex h-20 items-center border-b border-primary-foreground/10 px-6">
          <Brand inverse />
        </div>

        <div className="mx-4 mt-5 rounded-2xl border border-primary-foreground/10 bg-primary-foreground/[0.055] p-4">
          <p className="text-[10px] font-extrabold tracking-[0.16em] text-primary-foreground/45">BUSINESS WORKSPACE</p>
          <div className="mt-2 flex items-center gap-2">
            <Building2 className="size-4 text-primary-foreground/70" />
            <p className="min-w-0 flex-1 truncate text-sm font-bold">Rheinbau Projekt GmbH</p>
          </div>
          <span className="mt-3 inline-flex rounded-full border border-red-300/25 bg-red-500/15 px-2.5 py-1 text-[9px] font-black tracking-[0.12em] text-red-200">
            BUSINESS
          </span>
        </div>

        <nav className="mt-4 space-y-1 px-4" aria-label="Arbeitsbereich">
          {items.map(({ label, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-all ${pathname === to ? "bg-primary-foreground text-brand-dark shadow-lg" : "text-primary-foreground/62 hover:bg-primary-foreground/10 hover:text-primary-foreground"}`}
            >
              <Icon className="size-4" />
              {label}
              {label === "Benachrichtigungen" && unreadCount > 0 && (
                <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">{unreadCount}</span>
              )}
            </Link>
          ))}
          {future.map(({ label, icon: Icon }) => (
            <span key={label} className="flex h-11 items-center gap-3 px-3 text-sm font-semibold text-primary-foreground/30">
              <Icon className="size-4" />
              {label}
              <span className="ml-auto text-[9px] uppercase">bald</span>
            </span>
          ))}
        </nav>

        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/[0.045] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary-foreground/35">BAUSQO STATUS</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-primary-foreground/65">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,.08)]" />
              Workspace aktiv
            </div>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-[72px] items-center border-b bg-background/90 px-4 backdrop-blur-xl lg:ml-[17.5rem] lg:px-8">
        <div className="lg:hidden"><Brand /></div>
        <button
          type="button"
          className="ml-6 hidden h-10 w-full max-w-md items-center gap-2 rounded-xl border bg-muted/45 px-3 text-left text-sm text-muted-foreground lg:flex"
          onClick={() => { window.location.href = "/marketplace"; }}
        >
          <Search className="size-4" />
          <span className="flex-1">Aufträge, Firmen, Gewerke suchen…</span>
          <span className="rounded-md border bg-background px-2 py-0.5 text-[10px]">⌘ K</span>
        </button>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="relative rounded-xl border bg-background" aria-label="Benachrichtigungen">
            <Link to="/benachrichtigungen">
              <Bell className="size-4" />
              {unreadCount > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />}
            </Link>
          </Button>
          <Link
            to="/profil"
            aria-label="Profil"
            className="grid size-10 place-items-center rounded-full bg-primary/10 text-sm font-black text-primary"
          >
            RB
          </Link>
        </div>
      </header>

      <main className="pb-24 lg:ml-[17.5rem] lg:pb-8">{children}</main>

      <nav
        className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border border-primary-foreground/10 bg-brand-dark/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-2xl backdrop-blur-xl lg:hidden"
        aria-label="Mobile Navigation"
      >
        {mobileItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={`flex h-16 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold transition-colors ${pathname === item.to ? "bg-primary-foreground/10 text-primary-foreground" : "text-primary-foreground/45"}`}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
