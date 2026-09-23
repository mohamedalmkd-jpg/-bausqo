import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { PublicHeader } from "@/components/public-header";
import { Button } from "@/components/ui/button";
import { featuredItem } from "@/lib/demo-data";
import { MarketCard } from "@/components/market-card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BAUSQO – Bau. Match. Business." },
      {
        name: "description",
        content:
          "BAUSQO verbindet Bauunternehmen, Teams, Fachkräfte und Auftraggeber mit passenden Chancen in Deutschland.",
      },
      { property: "og:title", content: "BAUSQO – Bau. Match. Business." },
      {
        property: "og:description",
        content: "Bauaufträge, Firmen und Teams intelligent verbinden.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const quickLinks = [
  { icon: BriefcaseBusiness, title: "Aufträge", text: "Neue Projekte entdecken", to: "/marketplace" as const },
  { icon: Building2, title: "Firmen", text: "Partner & Auftraggeber", to: "/marketplace" as const },
  { icon: Users, title: "Teams", text: "Passende Kapazitäten", to: "/marketplace" as const },
  { icon: Sparkles, title: "Matches", text: "Passende Chancen", to: "/matches" as const },
];

function HomePage() {
  return (
    <div className="min-h-screen bg-muted/40">
      <PublicHeader />

      <main>
        <section className="px-4 pt-5 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-brand-dark text-primary-foreground shadow-2xl">
            <div className="absolute -right-24 -top-40 size-[32rem] rounded-full bg-primary/20 blur-2xl" />
            <div className="absolute -bottom-48 left-1/3 size-80 rounded-full bg-sky-400/10 blur-3xl" />

            <div className="relative grid gap-10 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1fr_280px] lg:px-14 lg:py-20">
              <div className="max-w-4xl">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">BAU. MATCH. BUSINESS.</p>
                <h1 className="mt-4 text-balance text-4xl font-black leading-[1.04] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                  Bauaufträge finden.
                  <br />
                  <span className="text-blue-300">Geschäft schneller machen.</span>
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-primary-foreground/65 sm:text-lg">
                  BAUSQO verbindet Unternehmen, Teams und Auftraggeber mit passenden Chancen –
                  übersichtlich, direkt und für den deutschen Baumarkt gedacht.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="h-12 rounded-xl px-6">
                    <Link to="/marketplace">
                      <Search className="size-4" />
                      Aufträge finden
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    className="h-12 rounded-xl bg-primary-foreground text-brand-dark hover:bg-primary-foreground/90"
                  >
                    <Link to="/auftrag/erstellen" search={{ draft: undefined }}>
                      <Plus className="size-4" />
                      Auftrag erstellen
                    </Link>
                  </Button>
                </div>

                <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm text-primary-foreground/50">
                  {["Deutschlandweit", "Direkte Kontakte", "Für alle Gewerke"].map((item) => (
                    <span key={item} className="flex items-center gap-2">
                      <Check className="size-4 text-emerald-400" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="hidden rounded-3xl border border-primary-foreground/10 bg-primary-foreground/[0.06] p-6 backdrop-blur-xl lg:block">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary-foreground/40">DEIN MARKT HEUTE</p>
                <p className="mt-3 text-5xl font-black tracking-[-0.05em]">2.481</p>
                <p className="mt-1 text-sm text-primary-foreground/55">aktive Chancen</p>
                <div className="mt-6 rounded-2xl bg-primary-foreground/[0.05] p-4">
                  <p className="text-xs text-primary-foreground/45">Diese Woche</p>
                  <p className="mt-1 text-sm font-bold"><span className="text-emerald-400">+18%</span> neue Möglichkeiten</p>
                </div>
                <div className="mt-5 flex h-14 items-end gap-1.5">
                  {[36, 52, 43, 76, 64, 92].map((height, index) => (
                    <span
                      key={index}
                      className="flex-1 rounded-t bg-primary/80"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-3 px-4 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {quickLinks.map(({ icon: Icon, title, text, to }) => (
            <Link
              key={title}
              to={to}
              className="group flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-extrabold">{title}</span>
                <span className="block truncate text-xs text-muted-foreground">{text}</span>
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">FÜR DICH</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight">Top Matches</h2>
              <p className="mt-1 text-sm text-muted-foreground">Aktuelle Chancen nach Relevanz und Geschäftspotenzial.</p>
            </div>
            <Link to="/marketplace" className="hidden items-center gap-2 text-sm font-bold text-primary sm:inline-flex">
              Alle anzeigen <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="rounded-2xl border bg-card p-3 shadow-sm">
              <div className="flex items-center justify-between border-b px-3 pb-3 pt-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">AKTUELLE EMPFEHLUNG</p>
                  <p className="mt-1 font-extrabold">Passender Auftrag für dein Profil</p>
                </div>
                <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[9px] font-black tracking-[0.1em] text-amber-700">
                  PRO
                </span>
              </div>
              <div className="p-2">
                <MarketCard item={featuredItem} />
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">MATCH STATUS</p>
              <div className="mt-5 flex items-end gap-2">
                <span className="text-5xl font-black tracking-[-0.05em] text-primary">94%</span>
                <span className="pb-1 text-sm font-bold text-muted-foreground">Match</span>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  ["Gewerk passt", Sparkles],
                  ["Region passt", MapPin],
                  ["Kontakt verfügbar", MessageSquare],
                  ["Profil vollständig", ShieldCheck],
                ].map(([label, Icon]) => {
                  const MatchIcon = Icon as typeof Sparkles;
                  return (
                    <div key={String(label)} className="flex items-center gap-3 rounded-xl bg-muted/55 px-3 py-3 text-sm font-semibold">
                      <MatchIcon className="size-4 text-primary" />
                      {String(label)}
                    </div>
                  );
                })}
              </div>
              <Button asChild className="mt-6 w-full rounded-xl">
                <Link to="/matches">Matches ansehen</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-y bg-background">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
            {[
              [ShieldCheck, "Klare Profile", "Unternehmen, Teams und Auftraggeber an einem Ort."],
              [Search, "Schneller finden", "Suche nach Gewerk, Ort, Volumen und Verfügbarkeit."],
              [Sparkles, "Passende Chancen", "Matching zeigt dir, was zu deinem Geschäft passt."],
            ].map(([Icon, title, text]) => {
              const TrustIcon = Icon as typeof ShieldCheck;
              return (
                <div key={String(title)} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <TrustIcon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-extrabold">{String(title)}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{String(text)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
