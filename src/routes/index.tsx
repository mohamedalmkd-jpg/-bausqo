import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  MapPin,
  MessageSquare,
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
      { title: "BAUSQO – Der passende Auftrag. Das richtige Team." },
      { name: "description", content: "BAUSQO verbindet Bauunternehmen, Teams, Fachkräfte und Auftraggeber in Deutschland." },
      { property: "og:title", content: "BAUSQO – Bau. Match. Business." },
      { property: "og:description", content: "Bauaufträge, Firmen und Teams intelligent verbinden." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const searchTabs = ["Aufträge", "Fachkräfte", "Unternehmen"] as const;

const quickActions = [
  { title: "Aufträge", text: "Projekte und Ausschreibungen", icon: BriefcaseBusiness, to: "/marketplace" as const },
  { title: "Unternehmen", text: "Partner und Auftraggeber", icon: Building2, to: "/marketplace" as const },
  { title: "Teams", text: "Kapazitäten entdecken", icon: Users, to: "/marketplace" as const },
  { title: "Matches", text: "Chancen priorisieren", icon: Sparkles, to: "/matches" as const },
];

function HomePage() {
  const [activeTab, setActiveTab] = useState<(typeof searchTabs)[number]>("Aufträge");

  return (
    <div className="min-h-screen bg-muted/25">
      <PublicHeader />

      <main className="bausqo-page pb-24 md:pb-0">
        <section className="px-0 pt-0 sm:px-4 sm:pt-5 lg:px-8">
          <div className="bausqo-grid-dark relative mx-auto max-w-7xl overflow-hidden bg-brand-dark text-white shadow-2xl sm:rounded-[2rem]">
            <div className="pointer-events-none absolute -right-24 -top-36 size-[34rem] rounded-full bg-primary/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 left-1/3 size-80 rounded-full bg-sky-400/8 blur-3xl" />

            <div className="relative grid gap-10 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[minmax(0,1fr)_330px] lg:px-14 lg:py-20">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-[3px] w-9 rounded-full bg-primary" />
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55">Das Netzwerk für Deutschlands Bauwirtschaft</p>
                </div>

                <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[1.01] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                  Der passende <span className="text-primary">Auftrag.</span>
                  <br />
                  Das richtige <span className="text-primary">Team.</span>
                </h1>

                <p className="mt-7 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
                  Finde Partner, Fachkräfte und neue Bauprojekte zentral in einem Workspace – schnell,
                  transparent und ohne Umwege.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="h-12 rounded-xl px-6 font-black text-brand-dark">
                    <Link to="/marketplace">
                      <Search className="size-4" />
                      Jetzt suchen
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-12 rounded-xl border-white/15 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white">
                    <Link to="/registrieren">Kostenlos starten <ArrowRight className="size-4" /></Link>
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/45">
                  {["Deutschlandweit", "Direkte Kontakte", "Alle Gewerke", "Mobile optimiert"].map((item) => (
                    <span key={item} className="flex items-center gap-2">
                      <Check className="size-4 text-primary" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="hidden lg:grid lg:content-start lg:gap-3">
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur">
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">Markt heute</p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-4xl font-black tracking-[-0.05em]">2.481</p>
                      <p className="mt-1 text-xs text-white/40">aktive Chancen</p>
                    </div>
                    <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black text-emerald-300">+18%</span>
                  </div>
                  <div className="mt-6 flex h-16 items-end gap-1.5">
                    {[42, 64, 48, 74, 60, 88, 72].map((height, index) => (
                      <span key={index} className="flex-1 rounded-t bg-primary/75" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.055] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">Top Match</p>
                      <p className="mt-2 text-3xl font-black text-primary">94%</p>
                    </div>
                    <Sparkles className="size-6 text-primary" />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-white/45">Gewerk, Region und Projektstart passen besonders gut zu deinem Profil.</p>
                </div>
              </div>
            </div>

            <div className="relative mx-4 mb-4 rounded-[1.65rem] bg-white p-4 text-slate-900 shadow-[0_28px_80px_rgba(2,12,27,.32)] sm:mx-8 sm:mb-8 sm:p-6 lg:-mt-3 lg:mx-14">
              <div className="flex gap-1 overflow-x-auto border-b">
                {searchTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`relative min-w-max flex-1 px-4 pb-4 pt-1 text-sm font-black sm:text-base ${activeTab === tab ? "text-slate-900" : "text-slate-400"}`}
                  >
                    {tab}
                    {activeTab === tab && <span className="absolute inset-x-1 bottom-0 h-[3px] rounded-full bg-primary" />}
                  </button>
                ))}
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-[1.2fr_.8fr_auto]">
                <div className="rounded-2xl border bg-slate-50/70 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Was suchst du?</p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <Search className="size-4 text-primary" />
                    z. B. Elektro, Rohbau, Trockenbau
                  </div>
                </div>
                <div className="rounded-2xl border bg-slate-50/70 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Wo?</p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="size-4 text-primary" />
                    z. B. Köln
                  </div>
                </div>
                <Button asChild className="min-h-16 rounded-2xl px-7 font-black text-brand-dark">
                  <Link to="/marketplace"><Search className="size-5" /> Suchen</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-3 px-4 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {quickActions.map(({ title, text, icon: Icon, to }) => (
            <Link key={title} to={to} className="bausqo-panel bausqo-lift group flex items-center gap-3 rounded-2xl p-4">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-black">{title}</span>
                <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{text}</span>
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">Für dich priorisiert</p>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] sm:text-3xl">Aktuelle Geschäftschance</h2>
              <p className="mt-1 text-sm text-muted-foreground">Wichtige Informationen sichtbar, bevor du Details öffnest.</p>
            </div>
            <Button asChild variant="outline" className="hidden rounded-xl sm:flex"><Link to="/matches">Alle Matches</Link></Button>
          </div>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_340px]">
            <MarketCard item={featuredItem} />

            <aside className="space-y-4">
              <div className="bausqo-panel rounded-[1.4rem] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">Match Analyse</p>
                    <p className="mt-2 text-4xl font-black tracking-[-0.05em] text-primary">94%</p>
                  </div>
                  <Sparkles className="size-6 text-primary" />
                </div>
                <div className="mt-5 space-y-2">
                  {[
                    ["Gewerk passt", "Sehr hoch"],
                    ["Region passt", "24 km"],
                    ["Startzeit passt", "Ja"],
                    ["Kontakt möglich", "Direkt"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-xl bg-muted/45 px-3 py-2.5 text-xs">
                      <span className="font-semibold text-muted-foreground">{label}</span>
                      <span className="font-black">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.4rem] bg-brand-dark p-5 text-white shadow-xl">
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/35">Schnellaktion</p>
                <h3 className="mt-2 text-lg font-black">Projekt direkt besprechen</h3>
                <p className="mt-2 text-xs leading-5 text-white/45">Starte eine Unterhaltung, ohne den Arbeitsbereich zu verlassen.</p>
                <Button asChild className="mt-5 w-full rounded-xl text-brand-dark">
                  <Link to="/nachrichten"><MessageSquare className="size-4" /> Nachrichten öffnen</Link>
                </Button>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-y bg-background">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
            {[
              [ShieldCheck, "Klare Profile", "Qualifikationen, Kapazitäten und Projektinformationen strukturiert vergleichen."],
              [Search, "Eine Suche", "Aufträge, Firmen, Teams und Fachkräfte ohne unnötige Wege entdecken."],
              [Sparkles, "Priorisierte Chancen", "Relevante Möglichkeiten schneller erkennen und direkt handeln."],
            ].map(([Icon, title, text]) => {
              const FeatureIcon = Icon as typeof ShieldCheck;
              return (
                <div key={String(title)} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><FeatureIcon className="size-5" /></span>
                  <div>
                    <h3 className="font-black">{String(title)}</h3>
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
