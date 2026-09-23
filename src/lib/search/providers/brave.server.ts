import type { ExternalResult } from "../types";
import { intentQueries, type ResultType } from "../classify";
import { throttled, type ExternalSearchProvider, type ProviderSearchArgs } from "./provider";

/**
 * Brave Search API (offizielle Such-API, eigener Schlüssel).
 * Liefert Titel, Snippet und Original-URL erlaubter Webquellen.
 * Es wird nichts an Plattformen vorbei gescraped – nur die offizielle API.
 */
const API = "https://api.search.brave.com/res/v1/web/search";
const ENV_KEY = "BRAVE_SEARCH_API_KEY";
/** Brave erlaubt offset 0–9 und count bis 20. */
const MAX_OFFSET = 9;
const MAX_COUNT = 20;

type BraveItem = {
  url?: string;
  title?: string;
  description?: string;
  age?: string;
  page_age?: string;
};

function toResult(item: BraveItem, hint?: ResultType): ExternalResult | null {
  if (!item.url) return null;
  let domain = item.url;
  try {
    domain = new URL(item.url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
  const published = item.age ?? item.page_age;
  return {
    id: `brave:${item.url}`,
    resultType: hint,
    title: item.title ?? item.url,
    description: item.description,
    sourceName: domain,
    sourceDomain: domain,
    sourceType: "search-api",
    originalUrl: item.url,
    externalId: item.url,
    publishedAt: published && !Number.isNaN(Date.parse(published)) ? new Date(published).toISOString() : undefined,
  };
}

export const braveProvider: ExternalSearchProvider = {
  id: "brave",
  name: "Brave Search",
  domain: "search.brave.com",
  requiredEnv: [ENV_KEY],
  enabled: true,
  note: "Websuche über die offizielle Brave Search API.",
  missingEnv() {
    return [ENV_KEY].filter((name) => !process.env[name]);
  },
  async search(args: ProviderSearchArgs): Promise<ExternalResult[]> {
    const apiKey = process.env[ENV_KEY];
    if (!apiKey) throw new Error("not-configured");

    async function runQuery(query: string, count: number, offset: number, hint?: ResultType): Promise<ExternalResult[]> {
      const url = new URL(API);
      url.searchParams.set("q", query);
      url.searchParams.set("count", String(Math.min(MAX_COUNT, count)));
      url.searchParams.set("offset", String(Math.min(MAX_OFFSET, Math.max(0, offset))));
      url.searchParams.set("country", "de");
      url.searchParams.set("search_lang", "de");
      url.searchParams.set("ui_lang", "de-DE");

      const request = async () =>
        fetch(url.toString(), {
          method: "GET",
          signal: args.signal,
          headers: { "X-Subscription-Token": apiKey as string, Accept: "application/json" },
        });

      let res = await request();
      if (res.status === 429) {
        // Rate-Limit des Tarifs respektieren: kurz warten, einmal erneut versuchen.
        await new Promise((r) => setTimeout(r, 1200));
        res = await request();
      }

      if (!res.ok) {
        const text = await res.text();
        console.error(`Brave search failed [${res.status}]: ${text}`);
        throw new Error(`HTTP ${res.status}`);
      }

      const body = (await res.json()) as { web?: { results?: BraveItem[] } };
      const items = body.web?.results ?? [];
      return items.map((i) => toResult(i, hint)).filter((r): r is ExternalResult => r !== null);
    }

    // Mehrere Suchvarianten je Richtung – Arbeitssuchende UND Personal-/Auftragssuche.
    const intents = intentQueries(args.query, args.location, args.intent);
    if (intents.length === 0) return [];

    // Seite 1 nutzt offset 0, weitere Seiten blättern in derselben Anfrage weiter.
    const offset = Math.min(MAX_OFFSET, Math.max(0, args.page - 1));
    const settled = await throttled(
      intents.map((i) => () => runQuery(i.query, MAX_COUNT, offset, i.type)),
      3,
      120,
    );

    const ok = settled.filter((s) => s.status === "fulfilled") as PromiseFulfilledResult<ExternalResult[]>[];
    if (ok.length === 0) {
      const first = settled[0];
      throw first && first.status === "rejected" && first.reason instanceof Error
        ? first.reason
        : new Error("Anbieter meldet einen Fehler");
    }
    return ok.flatMap((s) => s.value);
  },
};
