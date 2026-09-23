import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Bookmark, BriefcaseBusiness, FileText, Home, LayoutDashboard, MessageSquare, Search, Settings, Sparkles, UserRound, Plus, ChevronDown } from "lucide-react";
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
  return <div className="min-h-screen bg-background">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] border-r border-white/8 bg-brand-dark text-primary-foreground lg:block">
      <div className="flex h-20 items-center px-6"><Brand inverse /></div>
      <div className="mx-4 mb-5 rounded-2xl border border-white/10 bg-white/[.055] p-4">
        <div className="flex items-center justify-between"><span className="text-[10px] font-extrabold uppercase tracking-[.18em] text-white/45">Business Workspace</span><span className="rounded-full bg-brand-orange/15 px-2 py-1 text-[9px] font-black text-brand-orange">BUSINESS</span></div>
        <p className="mt-2 truncate text-sm font-bold">Rheinbau Projekt GmbH</p>
      </div>
      <nav className="space-y-1 px-3" aria-label="Arbeitsbereich">
        {items.map(({label,to,icon:Icon}) => {
          const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
          return <Link key={to} to={to} className={`group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-all duration-200 ${active ? "bg-white text-brand-dark shadow-lg" : "text-white/58 hover:bg-white/[.07] hover:text-white"}`}><Icon className={`size-[18px] ${active ? "text-primary" : "text-white/42 group-hover:text-white"}`} />{label}{label==="Benachrichtigungen"&&unreadCount>0&&<span className="ml-auto rounded-full bg-brand-orange px-2 py-0.5 text-[10px] font-black text-brand-dark">{unreadCount}</span>}</Link>
        })}
      </nav>
      <div className="absolute inset-x-4 bottom-5 border-t border-white/10 pt-4"><div className="flex items-center gap-3 rounded-xl px-2 py-2"><span className="grid size-9 place-items-center rounded-xl bg-primary font-black">RB</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">Rheinbau Projekt GmbH</p><p className="text-[10px] text-white/40">Unternehmenskonto</p></div><Settings className="size-4 text-white/35"/></div></div>
    </aside>
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl lg:ml-[280px] lg:px-8">
      <div className="lg:hidden"><Brand /></div>
      <div className="hidden lg:block"><p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-muted-foreground">BAUSQO Workspace</p><p className="mt-0.5 text-sm font-bold">Bauprojekte intelligent verbinden</p></div>
      <div className="flex items-center gap-2">
        <Button asChild className="hidden rounded-xl sm:inline-flex"><Link to="/auftrag/erstellen" search={{draft:undefined}}><Plus/> Auftrag erstellen</Link></Button>
        <Button asChild variant="ghost" size="icon" className="relative rounded-xl"><Link to="/benachrichtigungen"><Bell/>{unreadCount>0&&<span className="absolute right-2 top-2 size-2 rounded-full bg-brand-orange ring-2 ring-background"/>}</Link></Button>
        <Link to="/profil" className="flex items-center gap-2 rounded-xl border bg-card p-1.5 pr-2 shadow-sm"><span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-xs font-black text-primary">RB</span><ChevronDown className="hidden size-3.5 text-muted-foreground sm:block"/></Link>
      </div>
    </header>
    <main className="pb-24 lg:ml-[280px] lg:pb-10">{children}</main>
    <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border border-border/70 bg-background/95 p-1.5 pb-[max(.375rem,env(safe-area-inset-bottom))] shadow-2xl backdrop-blur-xl lg:hidden" aria-label="Mobile Navigation">
      {mobileItems.map(({label,to,icon:Icon})=>{const active=pathname===to||pathname.startsWith(to);return <Link key={label} to={to} className={`flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition-all ${active?"bg-primary/10 text-primary":"text-muted-foreground"}`}><Icon className="size-[19px]"/>{label}</Link>})}
    </nav>
  </div>;
}
