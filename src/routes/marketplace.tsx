import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, BellPlus, Filter, Globe, List, Loader2, Map as MapIcon, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { RealJobsSection } from "@/components/real-jobs-section";
import { ExternalResultCard, ExternalResults, useExternalSearch } from "@/components/external-results";
import { resultTypeMeta, resultTypes, type SearchIntent } from "@/lib/search/classify";
import { MarketCard } from "@/components/market-card";
import { MarketMap } from "@/components/market-map";
import { EmptyState } from "@/components/empty-state";
import { type MarketItem, type MarketKind } from "@/lib/demo-data";
import { ALL_CATEGORIES, availabilityOptions, categoryOptions, mapLabel, radiusSteps, searchMarket, type SortKey } from "@/lib/market-utils";
import { itemLink } from "@/lib/market-utils";
import { useWorkspace } from "@/lib/workspace-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace – BAUSQO" },
      { name: "description", content: "Demo-Jobs, Fachkräfte, Teams, Aufträge und Unternehmen durchsuchen – als Liste oder auf der Karte." },
      { property: "og:title", content: "BAUSQO Marketplace" },
      { property: "og:description", content: "Angebot und Bedarf in der Bauwirtschaft zusammenbringen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarketplacePage,
});

const kinds: { key: MarketKind; label: string }[] = [
  { key: "Jobs", label: "Arbeit finden" },
  { key: "Mitarbeiter", label: "Mitarbeiter finden" },
  { key: "Aufträge", label: "Aufträge finden" },
  { key: "Unternehmen", label: "Unternehmen finden" },
];

const sortOptions: SortKey[] = ["Relevanz", "Match %", "Entfernung", "Neueste"];

type FilterProps = {
  category: string;
  setCategory: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  radius: number;
  setRadius: (v: number) => void;
  availability: string[];
  toggleAvailability: (v: string) => void;
  reset: () => void;
};

function FilterPanel(p: FilterProps) {
  return (
    <div className="space-y-7">
      <div>
        <label htmlFor="f-cat" className="text-sm font-bold">Fachgebiet</label>
        <select id="f-cat" value={p.category} onChange={(e) => p.setCategory(e.target.value)} className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm">
          {categoryOptions.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="f-loc" className="text-sm font-bold">Standort / Stadt</label>
        <Input id="f-loc" value={p.location} onChange={(e) => p.setLocation(e.target.value)} className="mt-2 h-11" placeholder="z. B. Köln" />
      </div>
      <div>
        <label htmlFor="f-radius" className="text-sm font-bold">Umkreis: {p.radius} km</label>
        <input id="f-radius" type="range" min={10} max={200} step={5} value={p.radius} onChange={(e) => p.setRadius(Number(e.target.value))} className="mt-3 w-full accent-primary" />
        <div className="flex justify-between text-xs text-muted-foreground"><span>10 km</span><span>200 km</span></div>
      </div>
      <div>
        <span className="text-sm font-bold">Verfügbarkeit</span>
        <div className="mt-3 space-y-2">
          {availabilityOptions.map((x) => (
            <label key={x} className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" className="size-4 accent-primary" checked={p.availability.includes(x)} onChange={() => p.toggleAvailability(x)} /> {x}
            </label>
          ))}
        </div>
      </div>
      <Button variant="outline" className="w-full" onClick={p.reset}><RotateCcw /> Filter zurücksetzen</Button>
    </div>
  );
}

function MapPreviewCard({ item, onClose }: { item: MarketItem; onClose: () => void }) {
  const link = itemLink(item);
  return (
    <div className="rounded-lg border bg-card p-5 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-muted-foreground">{item.category}</p>
          <h3 className="mt-1 text-lg font-extrabold">{item.title}</h3>
          <p className="text-sm text-muted-foreground">{item.provider}</p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-extrabold text-primary">{item.match}%</span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
        <span>{mapLabel(item)}</span>
        <span>{item.people}</span>
        <span>Start: {item.start}</span>
        <span>{item.duration}</span>
      </dl>
      <div className="mt-5 flex gap-2">
        <Button asChild><Link to={link.to} params={link.params}>Details ansehen</Link></Button>
        <Button variant="ghost" onClick={onClose}>Schließen</Button>
      </div>
    </div>
  );
}

function MarketplacePage() {
  const [kind, setKind] = useState<MarketKind>("Jobs");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState(200);
  const [availability, setAvailability] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("Relevanz");
  const [view, setView] = useState<"alle" | "baumatch" | "extern" | "karte">("alle");
  const [intent, setIntent] = useState<SearchIntent>("ALLE");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { addSavedSearch } = useWorkspace();

  const filters = { kind, query, category, location, radiusKm: radius, availability };
  const result = useMemo(() => searchMarket(filters, sort), [kind, query, category, location, radius, availability, sort]);
  const visible = result.exact.length > 0 ? result.exact : result.nearby.length > 0 ? result.nearby : result.similar;
  const selected = visible.find((i) => i.id === selectedId) ?? null;

  const filterProps: FilterProps = {
    category, setCategory, location, setLocation, radius, setRadius, availability,
    toggleAvailability: (v) => setAvailability((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v])),
    reset: () => { setCategory(ALL_CATEGORIES); setLocation(""); setRadius(200); setAvailability([]); setQuery(""); setSelectedId(null); },
  };

  // Gewerk und Ort getrennt übergeben, damit beide Suchrichtungen sauber gebildet werden.
  const externalLocation = location || (result.parsed.location ?? "");
  const externalTerm = useMemo(() => {
    const raw = query.trim();
    if (!raw) return result.parsed.category ?? "";
    if (!externalLocation) return raw;
    const stripped = raw.replace(new RegExp(externalLocation.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig"), "").trim();
    return stripped || raw;
  }, [query, externalLocation, result.parsed.category]);

  const external = useExternalSearch({
    query: externalTerm,
    location: externalLocation,
    category,
    radiusKm: radius,
    intent,
  });
  const internalCount = visible.length;
  const externalCount = external.count;
  const totalCount = internalCount + externalCount;
  const searchTerm = [query, location].filter(Boolean).join(" ").trim();

  function jumpToExternal() {
    setView("alle");
    requestAnimationFrame(() => {
      document.getElementById("externe-ergebnisse")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function saveSearch() {
    const label = [query || category !== ALL_CATEGORIES ? (query || category) : kind, location || result.parsed.location, `${radius} km`].filter(Boolean).join(" · ");
    addSavedSearch({ label, kind, query, category, location: location || result.parsed.location || "", radiusKm: radius });
    toast.success("Suchauftrag lokal gespeichert – unter „Gespeichert“ zu finden.");
  }

  return (
    <AppShell>
      <div className="bausqo-page mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="bausqo-panel relative overflow-hidden rounded-[1.65rem] bg-card p-6 sm:p-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-primary">UNIVERSAL SEARCH</span>
            <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-foreground sm:text-4xl">Finde genau, was dein Projekt braucht.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Aufträge, Mitarbeiter, Teams und Unternehmen in einer Suche – intern, extern und auf der Karte.</p>
          </div>
          <div className="inline-flex flex-wrap rounded-2xl border bg-muted/35 p-1.5" role="group" aria-label="Ansicht">
            <Button size="sm" variant={view === "alle" ? "default" : "ghost"} onClick={() => setView("alle")}><List /> Alle ({totalCount})</Button>
            <Button size="sm" variant={view === "baumatch" ? "default" : "ghost"} onClick={() => setView("baumatch")}>BAUSQO ({internalCount})</Button>
            <Button size="sm" variant={view === "extern" ? "default" : "ghost"} onClick={() => setView("extern")}>Extern ({externalCount})</Button>
            <Button size="sm" variant={view === "karte" ? "default" : "ghost"} onClick={() => setView("karte")}><MapIcon /> Karte</Button>
          </div>
        </div>

        <div className="mt-5 flex overflow-x-auto rounded-2xl border bg-card p-1.5 shadow-sm" role="tablist">
          {kinds.map((k) => (
            <button key={k.key} role="tab" aria-selected={kind === k.key} onClick={() => { setKind(k.key); setSelectedId(null); }}
              className={`min-w-40 shrink-0 rounded-xl px-4 py-3 text-sm font-black transition-all ${kind === k.key ? "bg-brand-dark text-white shadow-lg" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}>
              {k.label}
            </button>
          ))}
        </div>

        <div className="bausqo-panel mt-4 rounded-2xl p-5">
          <span className="text-sm font-extrabold">Was suchst du?</span>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Was suchst du?">
            <Button size="sm" variant={intent === "ALLE" ? "default" : "outline"} onClick={() => setIntent("ALLE")} title="Alles durchsuchen">
              🔎 Alles
            </Button>
            {resultTypes.map((t) => (
              <Button
                key={t}
                size="sm"
                variant={intent === t ? "default" : "outline"}
                onClick={() => setIntent(t)}
                title={resultTypeMeta[t].hint}
              >
                {resultTypeMeta[t].icon} {resultTypeMeta[t].plural}
              </Button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {intent === "ALLE" ? "Alles durchsuchen – beide Richtungen." : resultTypeMeta[intent].hint}
            {" "}„Arbeitssuchende“ = jemand sucht Arbeit. „Mitarbeiter“ = jemand sucht Personal.
          </p>
        </div>

        <div className="mt-4 flex gap-3 rounded-2xl border bg-card p-2 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} className="h-12 rounded-xl border-0 bg-muted/45 pl-10 shadow-none focus-visible:ring-1" placeholder="z. B. „Trockenbauer Köln“" aria-label="Suche" />
          </div>
          <Sheet>
            <SheetTrigger asChild><Button className="lg:hidden" variant="outline"><Filter /> Filter</Button></SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-xl">
              <SheetHeader><SheetTitle>Ergebnisse filtern</SheetTitle></SheetHeader>
              <div className="mt-6 px-4 pb-8"><FilterPanel {...filterProps} /></div>
            </SheetContent>
          </Sheet>
        </div>

        {(result.parsed.category || result.parsed.location) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Suche interpretiert als:</span>
            {result.parsed.category && <span className="rounded bg-primary/10 px-2 py-1 font-bold text-primary">Gewerk: {result.parsed.category}</span>}
            {result.parsed.location && <span className="rounded bg-primary/10 px-2 py-1 font-bold text-primary">Ort: {result.parsed.location}</span>}
          </div>
        )}

        {searchTerm.length >= 3 && (
          <section aria-label="Suchergebnis-Übersicht" className="bausqo-panel mt-5 rounded-2xl p-5">
            <h2 className="flex items-center gap-2 text-base font-extrabold">
              <Search className="size-4" aria-hidden /> Suchergebnisse für „{searchTerm}“
            </h2>
            <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div><dt className="inline font-bold">BAUSQO: </dt><dd className="inline">{internalCount} Ergebnisse</dd></div>
              <div>
                <dt className="inline font-bold">Externe Quellen: </dt>
                <dd className="inline">
                  {external.loading ? "wird durchsucht …" : external.failed || external.errored.length > 0 && externalCount === 0 ? "momentan nicht verfügbar" : `${externalCount} relevante Ergebnisse`}
                </dd>
              </div>
              <div><dt className="inline font-bold">Gesamt: </dt><dd className="inline">{totalCount} Ergebnisse</dd></div>
            </dl>

            <div className="mt-4">
              <label htmlFor="f-intent" className="text-sm font-bold">Was suchst du?</label>
              <select
                id="f-intent"
                value={external.typeFilter}
                onChange={(e) => external.setTypeFilter(e.target.value as typeof external.typeFilter)}
                className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm sm:w-72"
              >
                <option value="ALLE">Alle ({external.allResults.length})</option>
                {resultTypes.map((t) => (
                  <option key={t} value={t}>{resultTypeMeta[t].plural} ({external.typeCounts[t]})</option>
                ))}
              </select>
              <p className="mt-2 text-xs text-muted-foreground">
                „Arbeitssuchende“ = jemand sucht Arbeit. „Stellenanzeigen“ = jemand sucht Personal.
              </p>
            </div>


            {external.loading && (
              <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground" role="status">
                <Loader2 className="size-4 animate-spin" aria-hidden /> Suche in BAUSQO … · Durchsuche verbundene externe Quellen …
              </p>
            )}

            {!external.loading && externalCount > 0 && (
              <div className="mt-4 rounded-md border border-primary/30 bg-primary/5 p-4">
                <p className="flex items-center gap-2 text-sm font-extrabold">
                  <Globe className="size-4" aria-hidden /> Externe Suche: {externalCount} relevante Ergebnisse
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Wir haben zusätzlich externe Quellen durchsucht.</p>
                {internalCount === 0 && <p className="mt-1 text-sm font-semibold">Keine passenden BAUSQO-Einträge gefunden.</p>}
                <Button className="mt-3 w-full sm:w-auto" size="sm" onClick={jumpToExternal}>
                  Externe Ergebnisse ansehen <ArrowDown />
                </Button>

                <div className="mt-4 space-y-3">
                  {external.results.slice(0, 3).map((item) => <ExternalResultCard key={`preview-${item.id}`} item={item} />)}
                </div>
                {externalCount > 3 && (
                  <Button variant="outline" size="sm" className="mt-3 w-full sm:w-auto" onClick={jumpToExternal}>
                    Alle {externalCount} externen Ergebnisse anzeigen <ArrowDown />
                  </Button>
                )}
              </div>
            )}

            {!external.loading && externalCount === 0 && external.searched && (
              <p className="mt-3 text-sm text-muted-foreground">Keine relevanten externen Anzeigen gefunden.</p>
            )}
            {!external.loading && externalCount === 0 && !external.searched && external.data !== null && (
              <p className="mt-3 text-sm text-muted-foreground">Externe Suche momentan nicht verfügbar.</p>
            )}
          </section>
        )}

        <div className="mt-6 grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="bausqo-panel sticky top-24 hidden self-start rounded-2xl p-5 lg:block">
            <div className="mb-6 flex items-center gap-2 font-extrabold"><SlidersHorizontal className="size-4" /> Filter</div>
            <FilterPanel {...filterProps} />
          </aside>

          <section>
            <div className={`mb-4 items-center justify-between gap-3 ${view === "extern" ? "hidden" : "flex"}`}>
              <p className="text-sm font-semibold">{visible.length} Demo-Ergebnisse{result.exact.length === 0 && result.nearby.length > 0 ? ` im erweiterten Umkreis (${result.nearbyRadius} km)` : result.similar.length > 0 ? " · ähnliche Ergebnisse" : ""}</p>
              <select aria-label="Sortierung" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-10 rounded-xl border bg-background px-3 text-sm">
                {sortOptions.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {result.exact.length === 0 && result.similar.length > 0 && (
              <div className="mb-5 rounded-lg border border-brand-orange/40 bg-brand-orange/5 p-5">
                <p className="text-sm font-extrabold">Keine Treffer für diesen Ort.</p>
                <p className="mt-1 text-sm text-muted-foreground">Noch keine passenden BAUSQO-Einträge in dieser Region – hier sind ähnliche Ergebnisse aus anderen Regionen.</p>
                <Button className="mt-4" size="sm" variant="secondary" onClick={saveSearch}><BellPlus /> Suchauftrag speichern</Button>
              </div>
            )}

            {result.exact.length === 0 && result.nearby.length > 0 && (
              <div className="mb-5 rounded-lg border border-brand-orange/40 bg-brand-orange/5 p-5">
                <p className="text-sm font-extrabold">Keine exakten Treffer innerhalb von {radius} km.</p>
                <p className="mt-1 text-sm text-muted-foreground">Wir zeigen Ergebnisse im erweiterten Umkreis von {result.nearbyRadius} km.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {radiusSteps.filter((s) => s > radius).map((s) => (
                    <Button key={s} size="sm" variant="outline" onClick={() => setRadius(s)}>Umkreis auf {s} km erweitern</Button>
                  ))}
                  <Button size="sm" variant="secondary" onClick={saveSearch}><BellPlus /> Suchauftrag speichern</Button>
                </div>
              </div>
            )}

            {kind === "Aufträge" && view !== "extern" && (
              <RealJobsSection query={query} category={category} location={location} map={view === "karte"} />
            )}

            {view === "extern" ? null : view === "karte" ? (
              <div className="space-y-4">
                <MarketMap items={visible} selectedId={selectedId} onSelect={setSelectedId} />
                <p className="text-xs text-muted-foreground">Privatprofile werden aus Datenschutzgründen nur ungefähr im Stadtgebiet angezeigt. Genaue Adressen erscheinen nur bei freigegebenen Unternehmens- und Projektstandorten.</p>
                {selected ? <MapPreviewCard item={selected} onClose={() => setSelectedId(null)} /> : visible.length > 0 ? <p className="text-sm text-muted-foreground">Auf eine Markierung tippen, um Details zu sehen.</p> : null}
                {visible.length === 0 && (
                  <EmptyState icon={Search} title="Keine passenden Einträge auf der Karte" text="Suchbegriff, Gewerk oder Umkreis anpassen." />
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {visible.length > 0 ? (
                  visible.map((item) => <MarketCard key={item.id} item={item} selected={item.id === selectedId} onSelect={setSelectedId} />)
                ) : (
                  <div className="bausqo-panel rounded-2xl p-8 text-center">
                    <h3 className="text-lg font-extrabold">Keine passenden BAUSQO-Einträge gefunden.</h3>
                    {externalCount > 0 ? (
                      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                        Wir haben zusätzlich externe Quellen durchsucht. {externalCount} relevante externe Ergebnisse gefunden.
                      </p>
                    ) : (
                      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                        Auch im erweiterten Umkreis gibt es aktuell keine passenden BAUSQO-Einträge in dieser Region. Speichern Sie die Suche – Sie sehen neue passende Einträge dann unter „Gespeichert“.
                      </p>
                    )}
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                      {externalCount > 0 && <Button onClick={jumpToExternal}>Externe Ergebnisse ansehen <ArrowDown /></Button>}
                      <Button variant={externalCount > 0 ? "outline" : "default"} onClick={saveSearch}><BellPlus /> Suchauftrag speichern</Button>
                      <Button variant="outline" onClick={filterProps.reset}><RotateCcw /> Filter zurücksetzen</Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(view === "alle" || view === "extern") && <ExternalResults state={external} />}
          </section>
        </div>

        {searchTerm.length >= 3 && (
          <div className="sticky bottom-24 z-30 mt-6 rounded-2xl border bg-card/95 p-3 shadow-2xl backdrop-blur-xl lg:hidden" aria-label="Kurzübersicht der Suche">
            <p className="truncate text-sm font-bold">🔎 {searchTerm}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {internalCount} BAUSQO · {externalCount} Extern · {totalCount} relevante Ergebnisse
            </p>
            {externalCount > 0 && (
              <Button size="sm" variant="outline" className="mt-2 w-full" onClick={jumpToExternal}>
                Externe Quellen gefunden <ArrowDown />
              </Button>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
