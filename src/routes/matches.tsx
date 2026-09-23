import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Filter, Sparkles, Target, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MarketCard } from "@/components/market-card";
import { marketItems } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Matches – BAUSQO" },
      { name: "description", content: "Priorisierte Vorschläge mit hoher fachlicher und organisatorischer Übereinstimmung." },
      { property: "og:title", content: "Matches – BAUSQO" },
      { property: "og:description", content: "Die relevantesten Geschäftschancen zuerst sehen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MatchesPage,
});

function MatchesPage() {
  const items = [...marketItems].filter((i) => i.match >= 85).sort((a, b) => b.match - a.match);
  const top = items[0]?.match ?? 0;
  const average = items.length ? Math.round(items.reduce((sum, item) => sum + item.match, 0) / items.length) : 0;

  return (
    <AppShell>
      <div className="bausqo-page mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="bausqo-grid-dark relative overflow-hidden rounded-[1.65rem] bg-brand-dark p-6 text-white shadow-2xl sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-primary/18 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-primary">Smart Matching</span>
              <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Die besten Chancen zuerst.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">BAUSQO priorisiert relevante Vorschläge nach fachlicher und organisatorischer Passung.</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3">
                <p className="text-[8px] font-black uppercase tracking-[0.12em] text-white/30">Matches</p>
                <p className="mt-1 text-2xl font-black">{items.length}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3">
                <p className="text-[8px] font-black uppercase tracking-[0.12em] text-white/30">Top</p>
                <p className="mt-1 text-2xl font-black text-primary">{top}%</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3">
                <p className="text-[8px] font-black uppercase tracking-[0.12em] text-white/30">Ø Match</p>
                <p className="mt-1 text-2xl font-black">{average}%</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            [Target, "Hohe Relevanz", "Nur Vorschläge ab 85 % werden hier priorisiert."],
            [TrendingUp, "Schneller entscheiden", "Wichtige Kriterien sind direkt auf jeder Karte sichtbar."],
            [Sparkles, "Transparent", "Der Match-Wert beschreibt Passung, nicht Verifizierung."],
          ].map(([Icon, title, text]) => {
            const InfoIcon = Icon as typeof Target;
            return (
              <div key={String(title)} className="bausqo-panel rounded-2xl p-4">
                <InfoIcon className="size-5 text-primary" />
                <p className="mt-3 text-sm font-black">{String(title)}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{String(text)}</p>
              </div>
            );
          })}
        </section>

        <div className="mt-7 flex items-center justify-between gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">Empfohlen</p>
            <h2 className="mt-1 text-xl font-black">Aktuelle Matches</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl"><Filter className="size-4" /> Filter</Button>
            <Button asChild className="rounded-xl"><Link to="/marketplace">Suche öffnen <ArrowRight className="size-4" /></Link></Button>
          </div>
        </div>

        <div className="mt-4 grid gap-4">{items.map((item) => <MarketCard key={item.id} item={item} />)}</div>
      </div>
    </AppShell>
  );
}
