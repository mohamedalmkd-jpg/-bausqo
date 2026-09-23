import { Link } from "@tanstack/react-router";
import { Bell, Plus, Search } from "lucide-react";
import { Brand } from "./brand";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { WorkspaceOptions } from "@/components/workspace-options";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

const nav = [
  { label: "Suche", to: "/marketplace" as const },
  { label: "Aufträge", to: "/meine-auftraege" as const },
  { label: "Dashboard", to: "/dashboard" as const },
];

export function PublicHeader() {
  const { user, ready, signOut } = useAuth();
  const signedIn = ready && Boolean(user);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/94 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Brand />

          <nav className="ml-8 hidden items-center gap-7 lg:flex" aria-label="Hauptnavigation">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="ml-auto hidden h-10 min-w-[280px] items-center gap-2 rounded-xl border bg-muted/45 px-3 text-left text-sm text-muted-foreground xl:flex"
            onClick={() => { window.location.href = "/marketplace"; }}
          >
            <Search className="size-4" />
            <span className="flex-1">Aufträge, Firmen, Gewerke suchen…</span>
            <span className="rounded-md border bg-background px-2 py-0.5 text-[10px]">⌘ K</span>
          </button>

          <div className="ml-auto flex items-center gap-2 md:hidden">
            <WorkspaceOptions />
            <Button asChild variant="ghost" size="icon" className="relative rounded-xl">
              <Link to="/benachrichtigungen" aria-label="Benachrichtigungen">
                <Bell className="size-6 text-sky-500" />
                <span className="absolute right-1.5 top-1 size-2.5 rounded-full border-2 border-background bg-teal-400" />
              </Link>
            </Button>
          </div>

          <div className="ml-auto hidden items-center gap-2 md:flex xl:ml-0">
            {signedIn ? (
              <>
                <Button asChild size="sm" className="rounded-xl">
                  <Link to="/auftrag/erstellen" search={{ draft: undefined }}>
                    <Plus className="size-4" />
                    Auftrag erstellen
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="icon" className="relative rounded-xl">
                  <Link to="/benachrichtigungen" aria-label="Benachrichtigungen">
                    <Bell className="size-4" />
                    <span className="absolute right-1.5 top-1 size-2 rounded-full bg-teal-400" />
                  </Link>
                </Button>
                <WorkspaceOptions />
                <Button variant="ghost" className="rounded-xl" onClick={() => void signOut()}>Abmelden</Button>
              </>
            ) : (
              <>
                <WorkspaceOptions />
                <Button asChild variant="ghost" className="rounded-xl">
                  <Link to="/auth" search={{ mode: "signin", redirect: undefined }}>Anmelden</Link>
                </Button>
                <Button asChild className="rounded-xl">
                  <Link to="/auth" search={{ mode: "signup", redirect: undefined }}>Kostenlos starten</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <MobileBottomNav />
    </>
  );
}
