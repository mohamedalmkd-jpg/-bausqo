import { Link } from "@tanstack/react-router";
import {
  BriefcaseBusiness,
  Building2,
  Crown,
  Grid3X3,
  Home,
  MessageSquare,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const options = [
  { label: "Home", hint: "Zur Startseite", icon: Home, to: "/" as const },
  { label: "Aufträge suchen", hint: "Passende Projekte finden", icon: Search, to: "/marketplace" as const },
  { label: "Unternehmen", hint: "Partner entdecken", icon: Building2, to: "/marketplace" as const },
  { label: "Auftrag", hint: "Projekt beschreiben", icon: Plus, to: "/auftrag/erstellen" as const },
  { label: "Mitgliedschaft", hint: "Workspace & Vorteile", icon: Crown, to: "/dashboard" as const },
  { label: "Nachrichten", hint: "Kontakte & Projekte", icon: MessageSquare, to: "/nachrichten" as const },
  { label: "Meine Aufträge", hint: "Projekte verwalten", icon: BriefcaseBusiness, to: "/meine-auftraege" as const },
  { label: "Profil", hint: "Konto verwalten", icon: UserRound, to: "/profil" as const },
];

export function WorkspaceOptions() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-11 rounded-2xl border-slate-200 bg-slate-50/90 px-4 text-base font-bold shadow-sm hover:bg-slate-100"
        >
          <Grid3X3 className="size-4" />
          Optionen
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-[2rem] border-0 p-0 shadow-2xl">
        <div className="overflow-hidden rounded-[2rem] bg-background">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0b2b38] via-[#0d3542] to-[#145060] px-7 pb-10 pt-8 text-white">
            <div className="absolute -right-16 -top-20 size-52 rounded-full bg-teal-300/10 blur-3xl" />
            <p className="relative text-sm font-medium uppercase tracking-[0.22em] text-teal-200/85">BAUSQO / WORKSPACE</p>
            <DialogTitle className="relative mt-5 max-w-lg text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
              Alles an einem Ort.
            </DialogTitle>
            <DialogDescription className="relative mt-3 max-w-lg text-sm leading-6 text-white/55">
              Navigiere direkt zu den wichtigsten Bereichen deines BAUSQO Workspaces.
            </DialogDescription>
          </div>

          <div className="p-5 sm:p-7">
            <div className="rounded-[1.6rem] border-[3px] border-teal-500/85 p-1 shadow-[0_0_0_4px_rgba(20,184,166,.08)]">
              <div className="flex h-16 items-center gap-3 rounded-[1.25rem] border bg-white px-5">
                <Search className="size-5 text-muted-foreground" />
                <span className="text-lg text-muted-foreground">Wohin möchtest du?</span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {options.map(({ label, hint, icon: Icon, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="group flex min-h-28 items-center gap-4 rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-lg"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-slate-100 text-teal-700 transition-colors group-hover:bg-teal-50">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-lg font-black text-slate-800">{label}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{hint}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
