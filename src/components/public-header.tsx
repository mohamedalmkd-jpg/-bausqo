import { Link } from "@tanstack/react-router";
import { Bell, Grid3X3, Menu, Plus, Search } from "lucide-react";
import { Brand } from "./brand";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";

const nav = [
  { label: "Suche", to: "/marketplace" as const },
  { label: "Matches", to: "/matches" as const },
  { label: "Dashboard", to: "/dashboard" as const },
  { label: "Mitgliedschaft", to: "/mitgliedschaft" as const },
];

export function PublicHeader() {
  const { user, ready, signOut } = useAuth();
  const signedIn = ready && Boolean(user);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/88 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Brand />

        <nav className="ml-7 hidden items-center gap-7 lg:flex" aria-label="Hauptnavigation">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="relative py-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-primary" }}
            >
              {item.label}
            </Link>
          ))}
          {signedIn && (
            <Link to="/meine-auftraege" className="text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">
              Meine Aufträge
            </Link>
          )}
        </nav>

        <button
          type="button"
          className="ml-auto hidden h-11 min-w-[290px] items-center gap-3 rounded-2xl border bg-muted/35 px-4 text-left text-sm text-muted-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-card hover:shadow-md xl:flex"
          onClick={() => { window.location.href = "/marketplace"; }}
        >
          <Search className="size-4 text-primary" />
          <span className="flex-1">Auftrag, Gewerk oder Ort…</span>
          <span className="rounded-lg border bg-background px-2 py-1 text-[10px] font-black">⌘ K</span>
        </button>

        <div className="ml-auto hidden items-center gap-2 md:flex xl:ml-0">
          {signedIn ? (
            <>
              <Button asChild className="rounded-xl">
                <Link to="/auftrag/erstellen" search={{ draft: undefined }}>
                  <Plus className="size-4" />
                  Auftrag erstellen
                </Link>
              </Button>
              <Button asChild variant="outline" size="icon" className="relative rounded-xl">
                <Link to="/benachrichtigungen" aria-label="Benachrichtigungen">
                  <Bell className="size-4" />
                  <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />
                </Link>
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
            <Button className="ml-auto rounded-xl md:hidden" size="icon" variant="outline" aria-label="Optionen öffnen">
              <Grid3X3 className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[92%] border-l-0 p-0 sm:max-w-md" side="right">
            <div className="relative overflow-hidden bg-brand-dark px-6 pb-9 pt-7 text-white">
              <div className="bausqo-grid-dark absolute inset-0 opacity-40" />
              <div className="relative">
                <SheetTitle className="text-white"><Brand inverse /></SheetTitle>
                <p className="mt-7 text-[10px] font-black uppercase tracking-[0.18em] text-primary">BAUSQO / WORKSPACE</p>
                <p className="mt-2 text-3xl font-black tracking-[-0.04em]">Alles an einem Ort.</p>
                <p className="mt-2 text-sm leading-6 text-white/50">Schnell zu Aufträgen, Firmen, Nachrichten und deinem Profil.</p>
              </div>
            </div>

            <nav className="grid grid-cols-2 gap-3 p-5">
              {[
                ["Suche", "/marketplace" as const, Search],
                ["Dashboard", "/dashboard" as const, Grid3X3],
                ["Nachrichten", "/nachrichten" as const, Bell],
                ["Profil", "/profil" as const, Menu],
              ].map(([label, to, Icon]) => {
                const NavIcon = Icon as typeof Search;
                return (
                  <Link key={String(label)} to={to as "/marketplace"} className="rounded-2xl border bg-card p-4 shadow-sm">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><NavIcon className="size-5" /></span>
                    <span className="mt-4 block text-sm font-black">{String(label)}</span>
                    <span className="mt-1 block text-[11px] text-muted-foreground">Direkt öffnen</span>
                  </Link>
                );
              })}
              <Link to="/auftrag/erstellen" search={{ draft: undefined }} className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-primary p-4 font-black text-brand-dark shadow-lg">
                <Plus className="size-5" />
                Auftrag erstellen
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <Button className="hidden rounded-xl md:flex lg:hidden" size="icon" variant="ghost" aria-label="Menü öffnen"><Menu /></Button>
          </SheetTrigger>
          <SheetContent className="w-[88%]" side="right">
            <SheetTitle><Brand /></SheetTitle>
            <nav className="mt-10 grid gap-2">
              {nav.map((item) => (
                <Button key={item.to} asChild variant="ghost" className="justify-start rounded-xl">
                  <Link to={item.to}>{item.label}</Link>
                </Button>
              ))}
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
