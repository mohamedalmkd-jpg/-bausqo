import { Link, useRouterState } from "@tanstack/react-router";
import { Home, MessageSquare, Plus, Search, UserRound } from "lucide-react";

const items = [
  { label: "Start", to: "/" as const, icon: Home },
  { label: "Suche", to: "/marketplace" as const, icon: Search },
  { label: "Chat", to: "/nachrichten" as const, icon: MessageSquare },
  { label: "Profil", to: "/profil" as const, icon: UserRound },
];

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/96 px-4 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-[0_-10px_35px_rgba(15,23,42,.06)] backdrop-blur-xl md:hidden"
      aria-label="Mobile Navigation"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 items-end">
        <Link
          to={items[0].to}
          className={`flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${pathname === "/" ? "text-teal-500" : "text-muted-foreground"}`}
        >
          <Home className="size-5" />
          Start
        </Link>

        <Link
          to={items[1].to}
          className={`flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${pathname === "/marketplace" ? "text-teal-500" : "text-muted-foreground"}`}
        >
          <Search className="size-5" />
          Suche
        </Link>

        <Link
          to="/auftrag/erstellen"
          search={{ draft: undefined }}
          aria-label="Auftrag erstellen"
          className="-mt-5 mx-auto grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-teal-300 to-teal-500 text-slate-950 shadow-[0_14px_35px_rgba(45,212,191,.34)] transition-transform active:scale-95"
        >
          <Plus className="size-8 stroke-[2.2]" />
        </Link>

        <Link
          to={items[2].to}
          className={`flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${pathname === "/nachrichten" ? "text-teal-500" : "text-muted-foreground"}`}
        >
          <MessageSquare className="size-5" />
          Chat
        </Link>

        <Link
          to={items[3].to}
          className={`flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${pathname === "/profil" ? "text-teal-500" : "text-muted-foreground"}`}
        >
          <UserRound className="size-5" />
          Profil
        </Link>
      </div>
    </nav>
  );
}
