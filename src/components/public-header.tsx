import { Link } from "@tanstack/react-router";
import { Bell, Menu, Plus, Search } from "lucide-react";
import { Brand } from "./brand";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";

const nav = [
  { label: "Suche", to: "/marketplace" as const },
  { label: "Aufträge", to: "/meine-auftraege" as const },
  { label: "Dashboard", to: "/dashboard" as const },
];

export function PublicHeader() {
  const { user, ready, signOut } = useAuth();
  const signedIn = ready && Boolean(user);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
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

        <div className="ml-auto hidden items-center gap-2 md:flex xl:ml-0">
          {signedIn ? (
            <>
              <Button asChild size="sm" className="rounded-xl">
                <Link to="/auftrag/erstellen" search={{ draft: undefined }}>
                  <Plus className="size-4" />
                  Auftrag erstellen
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="rounded-xl">
                <Link to="/benachrichtigungen" aria-label="Benachrichtigungen"><Bell className="size-4" /></Link>
              </Button>
              <Button variant="ghost" className="rounded-xl" onClick={() => void signOut()}>Abmelden</Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="rounded-xl">
                <Link to="/auth" search={{ mode: "signin", redirect: undefined }}>Anmelden</Link>
              </Button>
              <Button asChild className="rounded-xl">
                <Link to="/auth" search={{ mode: "signup", redirect: undefined }}>Kostenlos starten</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button className="ml-auto rounded-xl md:hidden" size="icon" variant="ghost" aria-label="Menü öffnen"><Menu /></Button>
          </SheetTrigger>
          <SheetContent className="w-[88%] border-l bg-background/98 backdrop-blur-xl" side="right">
            <SheetTitle><Brand /></SheetTitle>
            <nav className="mt-10 grid gap-2">
              <Button asChild variant="ghost" className="justify-start rounded-xl"><Link to="/marketplace">Suche</Link></Button>
              <Button asChild variant="ghost" className="justify-start rounded-xl"><Link to="/dashboard">Dashboard</Link></Button>
              {signedIn ? (
                <>
                  <Button asChild variant="ghost" className="justify-start rounded-xl"><Link to="/meine-auftraege">Meine Aufträge</Link></Button>
                  <Button asChild className="mt-6 rounded-xl"><Link to="/auftrag/erstellen" search={{ draft: undefined }}>Auftrag erstellen</Link></Button>
                  <Button variant="outline" className="rounded-xl" onClick={() => void signOut()}>Abmelden</Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="mt-6 rounded-xl"><Link to="/auth" search={{ mode: "signin", redirect: undefined }}>Anmelden</Link></Button>
                  <Button asChild className="rounded-xl"><Link to="/auth" search={{ mode: "signup", redirect: undefined }}>Kostenlos starten</Link></Button>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
