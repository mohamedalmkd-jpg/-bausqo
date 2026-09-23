import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ExternalLink, Globe, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { externalSearch } from "@/lib/search.functions";
import { resultTypeMeta, resultTypes, type ResultType, type SearchIntent } from "@/lib/search/classify";
import type { ExternalResult, ExternalSearchResponse, SearchStats } from "@/lib/search/types";

export function ExternalResultCard({ item, highlight }: { item: ExternalResult; highlight?: boolean }) {
  const type = item.resultType ? resultTypeMeta[item.resultType] : null;
  return (
    <article className={`rounded-lg border border-dashed p-5 ${highlight ? "border-primary/50 bg-primary/5" : "border-muted-foreground/40 bg-muted/30"}`}>
      <div className="flex flex-wrap items-center gap-2">
        {type && (
          <span className="inline-flex items-center gap-1.5 rounded bg-background px-2 py-1 text-xs font-extrabold uppercase tracking-wide">
            <span className={`size-2 rounded-full ${type.dot}`} aria-hidden /> {type.label}
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded bg-foreground/10 px-2 py-1 text-xs font-bold">
          <Globe className="size-3" /> Extern
        </span>
        {item.category && <span className="rounded bg-background px-2 py-1 text-xs font-semibold">{item.category}</span>}
        {typeof item.relevance === "number" && (
          <span className="rounded bg-background px-2 py-1 text-xs font-bold" title={(item.relevanceReasons ?? []).join(" · ")}>
            Übereinstimmung {item.relevance}%
          </span>
        )}
      </div>

      <h3 className="mt-3 text-base font-extrabold">{item.title}</h3>
      {item.description && <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{item.description}</p>}

      <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        {item.location && <span>{item.location}</span>}
        {item.postalCode && <span>PLZ {item.postalCode}</span>}
        {item.publishedAt && <span>Veröffentlicht: {new Date(item.publishedAt).toLocaleDateString("de-DE")}</span>}
        {item.employmentType && <span>{item.employmentType}</span>}
        {item.contractType && <span>{item.contractType}</span>}
        {item.salary && <span>{item.salary}</span>}
      </dl>

      <p className="mt-3 text-xs text-muted-foreground">
        Quelle: {item.sourceName} ({item.sourceDomain}) – kein BauMatch-Eintrag, keine Prüfung durch BauMatch.
      </p>

      <Button className="mt-4 w-full sm:w-auto" variant="outline" asChild>
        <a href={item.originalUrl} target="_blank" rel="noopener noreferrer nofollow">
          <ExternalLink /> Original ansehen
        </a>
      </Button>
    </article>
  );
}

export type ExternalSortKey = "Beste Übereinstimmung" | "Neueste";

export type ExternalSearchState = {
  /** Suchbegriff lang genug, damit überhaupt extern gesucht wird. */
  active: boolean;
  loading: boolean;
  loadingMore: boolean;
  failed: boolean;
  data: ExternalSearchResponse | null;
  results: ExternalResult[];
  count: number;
  page: number;
  hasMore: boolean;
  loadMore: () => void;
  /** Mindestens ein Anbieter hat erfolgreich geantwortet. */
  searched: boolean;
  unconfigured: { name: string }[];
  errored: { name: string }[];
  /** Alle gesammelten Treffer – unabhängig vom gewählten Ergebnistyp. */
  allResults: ExternalResult[];
  typeCounts: Record<ResultType, number>;
  typeFilter: ResultType | "ALLE";
  setTypeFilter: (t: ResultType | "ALLE") => void;
  sort: ExternalSortKey;
  setSort: (s: ExternalSortKey) => void;
  stats: SearchStats | null;
};

function mergeUnique(previous: ExternalResult[], incoming: ExternalResult[]): ExternalResult[] {
  const seen = new Set(previous.map((r) => r.id));
  const out = [...previous];
  for (const r of incoming) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
  }
  return out;
}

/** Holt externe Ergebnisse serverseitig – als Hook, damit die Seite Trefferzahlen oben anzeigen kann. */
export function useExternalSearch({
  query,
  location,
  category,
  radiusKm,
  intent,
}: {
  query: string;
  location: string;
  category: string;
  radiusKm: number;
  intent: SearchIntent;
}): ExternalSearchState {
  const [data, setData] = useState<ExternalSearchResponse | null>(null);
  const [collected, setCollected] = useState<ExternalResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<ResultType | "ALLE">("ALLE");
  const [sort, setSort] = useState<ExternalSortKey>("Beste Übereinstimmung");
  const runId = useRef(0);

  const term = `${query} ${location}`.trim();
  const active = term.length >= 3;

  // Neue Suche: gesammelte Treffer verwerfen und wieder bei Seite 1 beginnen.
  useEffect(() => {
    setPage(1);
    setCollected([]);
    setData(null);
  }, [query, location, category, radiusKm, intent]);

  useEffect(() => {
    if (!active) return;
    let live = true;
    const id = ++runId.current;
    if (page === 1) setLoading(true);
    else setLoadingMore(true);
    setFailed(false);
    const timer = setTimeout(() => {
      externalSearch({ data: { query, location, category, radiusKm, page, pageSize: 20, intent } })
        .then((res) => {
          if (!live || id !== runId.current) return;
          setData(res);
          setCollected((prev) => mergeUnique(page === 1 ? [] : prev, res.results));
        })
        .catch(() => { if (live && id === runId.current) setFailed(true); })
        .finally(() => {
          if (!live || id !== runId.current) return;
          setLoading(false);
          setLoadingMore(false);
        });
    }, 400);
    return () => { live = false; clearTimeout(timer); };
  }, [active, query, location, category, radiusKm, page, intent]);

  const allResults = useMemo(() => {
    const list = [...collected];
    if (sort === "Neueste") {
      list.sort((a, b) => {
        const av = a.publishedAt ? Date.parse(a.publishedAt) : 0;
        const bv = b.publishedAt ? Date.parse(b.publishedAt) : 0;
        return bv - av;
      });
    } else {
      list.sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0));
    }
    return list;
  }, [collected, sort]);

  const typeCounts = resultTypes.reduce(
    (acc, t) => ({ ...acc, [t]: allResults.filter((r) => r.resultType === t).length }),
    {} as Record<ResultType, number>,
  );
  const results = typeFilter === "ALLE" ? allResults : allResults.filter((r) => r.resultType === typeFilter);

  const loadMore = useCallback(() => setPage((p) => p + 1), []);

  return {
    active,
    loading,
    loadingMore,
    failed,
    data,
    results,
    allResults,
    typeCounts,
    typeFilter,
    setTypeFilter,
    sort,
    setSort,
    count: results.length,
    page,
    hasMore: Boolean(data?.hasMore),
    loadMore,
    searched: Boolean(data?.providers.some((p) => p.configured && p.ok)),
    unconfigured: data?.providers.filter((p) => !p.configured) ?? [],
    errored: data?.providers.filter((p) => p.configured && !p.ok) ?? [],
    stats: data?.stats ?? null,
  };
}

/** Externe Suchergebnisse – immer klar als extern gekennzeichnet. */
export function ExternalResults({ state }: { state: ExternalSearchState }) {
  const { active, loading, loadingMore, failed, data, results, unconfigured, errored, hasMore, loadMore } = state;
  const { allResults, typeCounts, typeFilter, setTypeFilter, sort, setSort } = state;
  if (!active) return null;

  const best = results.slice(0, 3);
  const rest = results.slice(3);

  return (
    <section id="externe-ergebnisse" className="mt-10 scroll-mt-24" aria-label="Externe Ergebnisse">
      <h2 className="flex items-center gap-2 text-lg font-extrabold">
        <Globe className="size-5" aria-hidden /> Externe Ergebnisse
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {results.length > 0
          ? `${results.length} relevante Anzeigen aus verbundenen externen Quellen. BauMatch zeigt nur Kurzinfos und verlinkt auf das Original.`
          : "Anzeigen aus erlaubten externen Quellen. BauMatch zeigt nur Kurzinfos und verlinkt auf das Original."}
      </p>

      {allResults.length > 0 && (
        <>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Ergebnistyp filtern">
            <Button size="sm" variant={typeFilter === "ALLE" ? "default" : "outline"} onClick={() => setTypeFilter("ALLE")}>
              Alle ({allResults.length})
            </Button>
            {resultTypes
              .filter((t) => typeCounts[t] > 0)
              .map((t) => (
                <Button key={t} size="sm" variant={typeFilter === t ? "default" : "outline"} onClick={() => setTypeFilter(t)}>
                  <span className={`size-2 rounded-full ${resultTypeMeta[t].dot}`} aria-hidden />
                  {resultTypeMeta[t].plural} ({typeCounts[t]})
                </Button>
              ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <label htmlFor="ext-sort" className="text-sm font-bold">Sortieren nach</label>
            <select
              id="ext-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as ExternalSortKey)}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option>Beste Übereinstimmung</option>
              <option>Neueste</option>
            </select>
          </div>
        </>
      )}

      {loading && (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground" role="status">
          <Loader2 className="size-4 animate-spin" /> Durchsuche verbundene externe Quellen …
        </p>
      )}

      {failed && (
        <p className="mt-4 rounded-lg border border-brand-orange/40 bg-brand-orange/5 p-4 text-sm">
          Externe Suche momentan nicht verfügbar. Die BauMatch-Ergebnisse oben sind davon nicht betroffen.
        </p>
      )}

      {data && (
        <>
          {errored.length > 0 && (
            <p className="mt-4 flex items-start gap-2 rounded-lg border border-brand-orange/40 bg-brand-orange/5 p-4 text-sm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              Externe Suche momentan nicht verfügbar ({errored.map((p) => p.name).join(", ")}).
            </p>
          )}
          {unconfigured.length > 0 && (
            <p className="mt-4 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Noch nicht konfiguriert: {unconfigured.map((p) => p.name).join(", ")}. Ein Administrator kann den Status
              unter „Integrationen“ einsehen.
            </p>
          )}

          {results.length > 0 ? (
            <>
              <h3 className="mt-6 flex items-center gap-2 text-base font-extrabold">
                <Star className="size-4" aria-hidden /> Beste Ergebnisse
              </h3>
              <div className="mt-3 space-y-4">
                {best.map((item) => <ExternalResultCard key={item.id} item={item} highlight />)}
              </div>
              {rest.length > 0 && (
                <div className="mt-6 space-y-4">
                  {rest.map((item) => <ExternalResultCard key={item.id} item={item} />)}
                </div>
              )}
            </>
          ) : (
            !loading && (
              <p className="mt-4 rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
                Keine relevanten externen Anzeigen gefunden.
              </p>
            )
          )}

          {hasMore && (
            <div className="mt-6 flex flex-col items-start gap-2">
              <Button variant="outline" disabled={loadingMore || loading} onClick={loadMore}>
                {loadingMore ? <Loader2 className="animate-spin" /> : null} Mehr Ergebnisse laden
              </Button>
              {loadingMore && <p className="text-sm text-muted-foreground" role="status">Weitere Ergebnisse werden gesucht …</p>}
            </div>
          )}
        </>
      )}
    </section>
  );
}
