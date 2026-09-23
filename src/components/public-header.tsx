import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Crown,
  FileText,
  Grid3X3,
  Home,
  Mail,
  Menu,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Brand } from "./brand";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";

const nav = [
  { label: "Suche", to: "/marketplace" as const },
  { label: "Matches", to: "/matches" as const },
  { label: "Dashboard", to: "/dashboard" as const },
  { label: "Mitgliedschaft", to: "/mitgliedschaft" as const },
  { label: "Kontakt", to: "/kontakt" as const },
];

const optionItems = [
  { label: "Startseite", hint: "Zur BAUSQO Home", to: "/" as const, icon: Home },
  { label: "Suche", hint: "Aufträge & Firmen", to: "/marketplace" as const, icon: Search },
  { label: "Dashboard", hint: "Dein Überblick", to: "/dashboard" as const, icon: Grid3X3 },
  { label: "Aufträge", hint: "Eigene Projekte", to: "/meine-auftraege" as const, icon: BriefcaseBusiness },
  { label: "Nachrichten", hint: "Chats öffnen", to: "/nachrichten" as const, icon: MessageSquare },
  { label: "Gespeichert", hint: "Merkliste", to: "/gespeichert" as const, icon: Bookmark },
  { label: "Mitgliedschaft", hint: "FREE · PRO · BUSINESS", to: "/mitgliedschaft" as const, icon: Crown },
  { label: "Profil", hint: "Konto & Angaben", to: "/profil" as const, icon: UserRound },
  { label: "Kontakt", hint: "BAUSQO erreichen", to: "/kontakt" as const, icon: Mail },
  { label: "Datenschutz", hint: "Datenschutzhinweise", to: "/datenschutz" as const, icon: ShieldCheck },
  { label: "Impressum", hint: "Anbieterangaben", to: "/impressum" as const, icon: FileText },
];

export function PublicHeader() {
  const { user, ready, signOut } = useAuth();
  const navigate = useNavigate();
  const signedIn = ready && Boolean(user);

  async function handleSignOut() {
    await signOut();
    void navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/88 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Brand />

        <nav className="ml-7 hidden items-center gap-6 lg:flex" aria-label="Hauptnavigation">
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
          className="ml-auto hidden h-11 min-w-[270px] items-center gap-3 rounded-2xl border bg-muted/35 px-4 text-left text-sm text-muted-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-card hover:shadow-md xl:flex"
          onClick={() => { void navigate({ to: "/marketplace" }); }}
        >
          <Search className="size-4 text-primary" />
          <span className="flex-1">Auftrag, Gewerk oder Ort…</span>
          <span className="rounded-lg border bg-background px-2 py-1 text-[10px] font-black">⌘ K</span>
        </button>

        <div className="ml-auto hidden items-center gap-2 lg:flex xl:ml-0">
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
              <Button variant="ghost" className="rounded-xl" onClick={() => void handleSignOut()}>Abmelden</Button>
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
            <Button className="ml-auto rounded-xl lg:hidden" size="icon" variant="outline" aria-label="Optionen öffnen">
              <Grid3X3 className="size-5" />
            </Button>
          </SheetTrigger>

          <SheetContent className="w-[94%] overflow-y-auto border-l-0 p-0 sm:max-w-md" side="right">
            <div className="bausqo-grid-dark relative overflow-hidden bg-brand-dark px-6 pb-8 pt-7 text-white">
              <div className="bausqo-menu-orb absolute -right-16 -top-20 size-52 rounded-full bg-primary/16 blur-3xl" />
              <div className="relative">
                <SheetTitle className="text-white"><Brand inverse /></SheetTitle>
                <p className="mt-7 text-[10px] font-black uppercase tracking-[0.18em] text-primary">BAUSQO / OPTIONEN</p>
                <p className="mt-2 text-3xl font-black tracking-[-0.04em]">Schnell überall hin.</p>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  Alle wichtigen Bereiche, Hilfe und Rechtliches in einer Liste.
                </p>
              </div>
            </div>

            <nav className="grid grid-cols-2 gap-3 p-5">
              {optionItems.map(({ label, hint, to, icon: Icon }) => (
                <SheetClose asChild key={to}>
                  <Link to={to} className="bausqo-option-card group rounded-2xl border bg-card p-4 shadow-sm">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:-rotate-3 group-hover:scale-105">
                      <Icon className="size-5" />
                    </span>
                    <span className="mt-4 block text-sm font-black">{label}</span>
                    <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>
                  </Link>
                </SheetClose>
              ))}

              <SheetClose asChild>
                <Link
                  to="/auftrag/erstellen"
                  search={{ draft: undefined }}
                  className="bausqo-option-primary col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-primary p-4 font-black text-brand-dark shadow-lg"
                >
                  <Plus className="size-5" />
                  Auftrag erstellen
                </Link>
              </SheetClose>
            </nav>

            <div className="border-t p-5">
              {signedIn ? (
                <SheetClose asChild>
                  <Button variant="outline" className="h-11 w-full rounded-xl" onClick={() => void handleSignOut()}>
                    Abmelden · zurück zur Home
                  </Button>
                </SheetClose>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <SheetClose asChild>
                    <Button asChild variant="outline" className="rounded-xl">
                      <Link to="/auth" search={{ mode: "signin", redirect: undefined }}>Anmelden</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button asChild className="rounded-xl">
                      <Link to="/auth" search={{ mode: "signup", redirect: undefined }}>Registrieren</Link>
                    </Button>
                  </SheetClose>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
