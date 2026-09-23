import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Search,
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
      {
        name: "description",
        content:
          "BAUSQO verbindet Bauunternehmen, Fachkräfte, Teams und Auftraggeber in Deutschland.",
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

const searchTabs = ["Aufträge", "Fachkräfte", "Unternehmen"] as const;

function MobileSwipeHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("bausqo-swipe-hint-seen")) {
        setVisible(true);
        const timer = window.setTimeout(() => {
          setVisible(false);
          localStorage.setItem("bausqo-swipe-hint-seen", "1");
        }, 7000);
        return () => window.clearTimeout(timer);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => {
        setVisible(false);
        try { localStorage.setItem("bausqo-swipe-hint-seen", "1"); } catch {}
      }}
      className="fixed inset-x-6 bottom-[92px] z-40 mx-auto max-w-sm rounded-[1.7rem] border border-white/10 bg-[#103744]/96 px-4 py-4 text-white shadow-2xl backdrop-blur-xl md:hidden"
    >
      <span className="flex items-center justify-between">
        <span className="grid size-11 place-items-center rounded-2xl bg-white/5 text-teal-300"><ArrowLeft className="size-5" /></span>
        <span className="px-3 text-center">
          <span className="block text-[11px] text-white/55">← Wischen zum Wechseln →</span>
          <span className="mt-1 block text-base font-black">Home</span>
          <span className="mx-auto mt-2 block h-1 w-14 rounded-full bg-gradient-to-r from-teal-300 to-slate-600" />
        </span>
        <span className="grid size-11 place-items-center rounded-2xl bg-white/5 text-teal-300"><ArrowRight className="size-5" /></span>
      </span>
    </button>
  );
}

function HomePage() {
  const [activeTab, setActiveTab] = useState<(typeof searchTabs)[number]>("Aufträge");

  return (
    <div className="min-h-screen bg-[#f7fafb]">
      <PublicHeader />
      <MobileSwipeHint />

      <main className="pb-24 md:pb-0">
        <div className="border-b bg-gradient-to-r from-teal-50 via-white to-sky-50 py-2 text-center text-xs text-muted-foreground md:hidden">
          Aufträge · Keine echten Transaktionen
        </div>

        <section className="relative overflow-hidden bg-gradient-to-br from-[#0b2b38] via-[#0d3542] to-[#165160] text-white lg:mx-auto lg:mt-6 lg:max-w-7xl lg:rounded-[2rem]">
          <div className="pointer-events-none absolute -left-32 top-16 size-80 rounded-full border border-white/5" />
          <div className="pointer-events-none absolute -right-28 -top-24 size-[28rem] rounded-full bg-teal-300/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] [background-size:72px_72px]" />

          <div className="relative mx-auto max-w-7xl px-7 pb-10 pt-14 sm:px-10 sm:pb-14 sm:pt-16 lg:px-14 lg:pb-16 lg:pt-20">
            <div className="max-w-4xl">
              <div className="flex items-start gap-4">
                <span className="mt-3 h-[3px] w-9 shrink-0 rounded-full bg-teal-300" />
                <p className="max-w-xl text-xs font-black uppercase tracking-[0.18em] text-white/75 sm:text-sm">
                  Das Netzwerk für Deutschlands Bauwirtschaft
                </p>
              </div>

              <div className="relative mt-7 inline-block">
                <div className="pointer-events-none absolute -inset-x-1 -inset-y-4 border-2 border-sky-500/60 [clip-path:polygon(0_0,63%_0,63%_5%,100%_5%,100%_100%,85%_100%,85%_97%,0_97%)]" />
                <h1 className="relative max-w-4xl text-5xl font-black leading-[1.03] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                  Der passende
                  <br />
                  <span className="text-teal-300">Auftrag.</span>
                  <br />
                  Das richtige <span className="text-teal-300">Team.</span>
                </h1>
              </div>

              <p className="mt-9 max-w-3xl text-lg leading-8 text-white/68 sm:text-xl">
                Finde geprüfte Partner, qualifizierte Fachkräfte und neue Bauprojekte – zentral,
                transparent und ohne Umwege.
              </p>
            </div>

            <div className="mt-10 rounded-[1.6rem] bg-white p-5 text-slate-900 shadow-[0_24px_70px_rgba(2,12,27,.28)] sm:p-7">
              <div className="flex gap-1 overflow-x-auto border-b">
                {searchTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`relative min-w-max flex-1 px-4 pb-4 pt-1 text-base font-black transition-colors sm:text-lg ${activeTab === tab ? "text-slate-900" : "text-slate-500"}`}
                  >
                    {tab}
                    {activeTab === tab && <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-teal-300" />}
                  </button>
                ))}
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-[1.2fr_.8fr_auto]">
                <label className="rounded-2xl border bg-white p-4">
                  <span className="block text-[11px] font-black uppercase tracking-[0.08em] text-slate-400">Was suchst du?</span>
                  <span className="mt-2 flex items-center gap-2 text-base text-slate-400">
                    <Search className="size-4" />
                    z. B. Elektro, Trockenbau
                  </span>
                </label>
                <label className="rounded-2xl border bg-white p-4">
                  <span className="block text-[11px] font-black uppercase tracking-[0.08em] text-slate-400">Wo?</span>
                  <span className="mt-2 block text-base text-slate-400">z. B. Köln</span>
                </label>
                <Button asChild className="h-auto min-h-16 rounded-2xl bg-teal-400 px-6 text-slate-950 hover:bg-teal-300">
                  <Link to="/marketplace">
                    <Search className="size-5" />
                    Suchen
                  </Link>
                </Button>
              </div>

              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                {["Deutschlandweit", "Direkte Kontakte", "Alle Gewerke"].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="size-4 text-teal-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-teal-600">Aktuelle Chancen</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Passende Aufträge für dich</h2>
            </div>
            <Link to="/marketplace" className="hidden items-center gap-2 text-sm font-bold text-teal-700 sm:inline-flex">
              Alle ansehen <ArrowRight className="size-4" />
            </Link>
          </div>
          <MarketCard item={featuredItem} />
        </section>

        <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-12 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            [Building2, "Unternehmen", "Partner und Auftraggeber gezielt entdecken."],
            [Users, "Fachkräfte & Teams", "Kapazitäten und Kompetenzen schneller finden."],
            [Sparkles, "Smart Matches", "Relevante Geschäftschancen priorisiert sehen."],
          ].map(([Icon, title, text]) => {
            const FeatureIcon = Icon as typeof Building2;
            return (
              <article key={String(title)} className="rounded-2xl border bg-white p-5 shadow-sm">
                <span className="grid size-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
                  <FeatureIcon className="size-5" />
                </span>
                <h3 className="mt-4 font-black">{String(title)}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{String(text)}</p>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
