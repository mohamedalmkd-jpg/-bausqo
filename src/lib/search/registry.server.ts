import type { ExternalResult, ExternalSearchResponse, ProviderId, ProviderOutcome, ProviderStatus } from "./types";
import { scoreRelevance } from "./types";
import { classifyResult, isRelevantResult, type ResultType, type SearchIntent } from "./classify";
import { statusOf, type ExternalSearchProvider } from "./providers/provider";
import { arbeitsagenturProvider } from "./providers/arbeitsagentur.server";
import { googleProvider } from "./providers/google-cse.server";
import { firecrawlProvider } from "./providers/firecrawl.server";
import { braveProvider } from "./providers/brave.server";

/** Registrierte Quellen. Neue Anbieter werden nur hier ergänzt. */
export const providers: ExternalSearchProvider[] = [
  braveProvider,
  firecrawlProvider,
  arbeitsagenturProvider,
  googleProvider,
];

/** Status aller registrierten Anbieter – nie mit Secret-Werten. */
export function providerStatuses(): ProviderStatus[] {
  return providers.map(statusOf);
}

type CacheEntry = { at: number; results: ExternalResult[] };
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

function cacheGet(key: string): ExternalResult[] | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.results;
}

function cacheSet(key: string, results: ExternalResult[]) {
  if (cache.size > 200) cache.clear();
  cache.set(key, { at: Date.now(), results });
}

/** Entfernt Duplikate über externe ID, kanonische URL und (Titel + Quelle/Ort). */
export function dedupe(results: ExternalResult[]): ExternalResult[] {
  const seen = new Set<string>();
  const out: ExternalResult[] = [];
  for (const r of results) {
    let canonical = r.originalUrl;
    try {
      const u = new URL(r.originalUrl);
      u.hash = "";
      u.search = "";
      canonical = `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/$/, "")}`;
    } catch {
      /* URL nicht parsebar – Rohwert nutzen */
    }
    const keys = [
      r.externalId ? `${r.sourceDomain}:${r.externalId}` : null,
      canonical,
      `${r.sourceDomain}|${r.title.toLowerCase().trim()}|${(r.city ?? r.location ?? "").toLowerCase().trim()}`,
    ].filter(Boolean) as string[];
    if (keys.some((k) => seen.has(k))) continue;
    keys.forEach((k) => seen.add(k));
    out.push(r);
  }
  return out;
}

export type SearchArgs = {
  query: string;
  location: string;
  category: string;
  radiusKm: number;
  page: number;
  pageSize: number;
  sources: string[];
  intent: SearchIntent;
};

const TIMEOUT_MS = 20000;

async function runProvider(
  provider: ExternalSearchProvider,
  args: SearchArgs,
): Promise<{ outcome: ProviderOutcome; results: ExternalResult[] }> {
  const status = statusOf(provider);
  const started = Date.now();
  const base = {
    provider: provider.id,
    name: provider.name,
    configured: status.configured,
    cached: false,
    durationMs: 0,
    count: 0,
  };

  if (!status.configured) {
    return {
      outcome: { ...base, ok: false, error: `Nicht konfiguriert – fehlt: ${status.missingEnv.join(", ")}` },
      results: [],
    };
  }

  const cacheKey = `${provider.id}|${args.intent}|${args.query}|${args.location}|${args.radiusKm}|${args.page}|${args.pageSize}`;
  const cached = cacheGet(cacheKey);
  if (cached) {
    return { outcome: { ...base, ok: true, cached: true, count: cached.length, durationMs: 0 }, results: cached };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const results = await provider.search({ ...args, signal: controller.signal });
    cacheSet(cacheKey, results);
    return {
      outcome: { ...base, ok: true, count: results.length, durationMs: Date.now() - started },
      results,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return {
      outcome: {
        ...base,
        ok: false,
        error: message === "not-configured" ? "Nicht konfiguriert" : message,
        durationMs: Date.now() - started,
      },
      results: [],
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Maximale Seitenzahl je Suche – schützt vor unbegrenzten API-Aufrufen. */
export const MAX_PAGES = 10;

export async function runExternalSearch(args: SearchArgs): Promise<ExternalSearchResponse> {
  const active = providers.filter(
    (p) => p.enabled && (args.sources.length === 0 || args.sources.includes(p.id)),
  );

  const settled = await Promise.all(active.map((p) => runProvider(p, args)));
  const professionTerms = `${args.query} ${args.category}`
    .split(/[\s,/]+/)
    .filter((t) => t.length > 3 && !t.startsWith("Alle"));

  const raw = settled.flatMap((s) => s.results);

  const relevant = raw
    .filter((r) => isRelevantResult({ title: r.title, description: r.description, url: r.originalUrl }, professionTerms))
    .map((r) => ({
      ...r,
      classified: classifyResult({ title: r.title, description: r.description, url: r.originalUrl }, r.resultType),
    }))
    // Unklare Treffer erscheinen nicht in den Hauptergebnissen.
    .filter((r) => r.classified !== "OTHER")
    .map(({ classified, ...r }) => ({ ...r, resultType: classified as ResultType }));

  const deduped = dedupe(relevant);

  const merged = deduped.map((r) => {
    const { score, reasons } = scoreRelevance(r, args.query, args.location, args.category);
    // Gewählte Suchabsicht zählt als echtes Übereinstimmungssignal.
    const matchesIntent = args.intent !== "ALLE" && r.resultType === args.intent;
    return {
      ...r,
      relevance: Math.min(99, score + (matchesIntent ? 12 : 0)),
      relevanceReasons: matchesIntent ? [...reasons, "Passt zur gewählten Suchabsicht"] : reasons,
    };
  });
  merged.sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0));

  return {
    results: merged,
    providers: settled.map((s) => ({ ...s.outcome, count: s.outcome.count })),
    page: args.page,
    pageSize: args.pageSize,
    hasMore: merged.length > 0 && args.page < MAX_PAGES,
    stats: {
      received: raw.length,
      accepted: merged.length,
      rejected: raw.length - relevant.length,
      duplicates: relevant.length - deduped.length,
    },
  };
}

/** Health-Check: echte Testabfrage gegen eine einzelne Quelle. */
export async function checkProvider(id: ProviderId): Promise<ProviderOutcome> {
  const provider = providers.find((p) => p.id === id);
  if (!provider) throw new Error("Unbekannte Quelle");
  const { outcome } = await runProvider(provider, {
    query: "Elektriker",
    location: "Köln",
    category: "",
    radiusKm: 50,
    page: 1,
    pageSize: 3,
    sources: [id],
    intent: "ALLE",
  });
  return outcome;
}
