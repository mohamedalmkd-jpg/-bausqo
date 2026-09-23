import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Bookmark, BriefcaseBusiness, FileText, Home, LayoutDashboard, MessageSquare, Search, Settings, Sparkles, UserRound } from "lucide-react";
import { Brand } from "./brand";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/lib/workspace-state";

const items = [
  { label: "Dashboard", to: "/dashboard" as const, icon: LayoutDashboard },
  { label: "Marketplace", to: "/marketplace" as const, icon: Search },
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
  { label: "Home", to: "/dashboard" as const, icon: Home },
  { label: "Suche", to: "/marketplace" as const, icon: Search },
  { label: "Matches", to: "/matches" as const, icon: Sparkles },
  { label: "Nachrichten", to: "/nachrichten" as const, icon: MessageSquare },
  { label: "Profil", to: "/profil" as const, icon: UserRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { unreadCount } = useWorkspace();

  return <div className="min-h-screen bg-muted/50">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-brand-dark text-primary-foreground lg:block">
      <div className="flex h-20 items-center border-b border-primary-foreground/10 px-6"><Brand inverse /></div>
      <nav className="space-y-1 p-4" aria-label="Arbeitsbereich">
        {items.map(({ label, to, icon: Icon }) => <Link key={to} to={to} className={`flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors ${pathname === to ? "bg-primary text-primary-foreground" : "text-primary-foreground/65 hover:bg-primary-foreground/10 hover:text-primary-foreground"}`}><Icon className="size-4" />{label}{label === "Benachrichtigungen" && unreadCount > 0 && <span className="ml-auto rounded-full bg-brand-orange px-2 text-[10px] font-bold text-background">{unreadCount}</span>}</Link>)}
        {future.map(({ label, icon: Icon }) => <span key={label} className="flex h-11 items-center gap-3 px-3 text-sm font-semibold text-primary-foreground/35"><Icon className="size-4" />{label}<span className="ml-auto text-[9px] uppercase">bald</span></span>)}
      </nav>
      <div className="absolute inset-x-4 bottom-5 rounded-md border border-primary-foreground/10 bg-primary-foreground/5 p-4"><p className="text-xs text-primary-foreground/50">Demo-Konto</p><p className="mt-1 text-sm font-bold">Rheinbau Projekt GmbH</p></div>
    </aside>

    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 lg:ml-64 lg:px-8">
      <div className="lg:hidden"><Brand /></div>
      <div className="hidden lg:block"><p className="text-sm font-semibold">BauMatch Arbeitsbereich</p></div>
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" aria-label="Benachrichtigungen">
          <Link to="/benachrichtigungen" className="relative"><Bell />{unreadCount > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-brand-orange" />}</Link>
        </Button>
        <Link to="/profil" aria-label="Profil" className="grid size-9 place-items-center rounded-full bg-primary/10 text-sm font-extrabold text-primary">RB</Link>
      </div>
    </header>

    <main className="pb-24 lg:ml-64 lg:pb-8">{children}</main>

    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-background px-2 pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Mobile Navigation">
      {mobileItems.map((item) => <Link key={item.label} to={item.to} className={`flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-semibold ${pathname === item.to ? "text-primary" : "text-muted-foreground"}`}><item.icon className="size-5" />{item.label}</Link>)}
    </nav>
  </div>;
}
