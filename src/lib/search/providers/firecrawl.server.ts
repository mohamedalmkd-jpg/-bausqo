import type { ExternalResult } from "../types";
import { intentQueries, type ResultType } from "../classify";
import type { ExternalSearchProvider, ProviderSearchArgs } from "./provider";

/**
 * Firecrawl Search (offizielle Such-API, über den Lovable-Connector-Gateway).
 * Liefert Titel, Snippet und Original-URL erlaubter Webquellen.
 * Es wird nichts an Plattformen vorbei gescraped – nur die offizielle API.
 */
const GATEWAY = "https://connector-gateway.lovable.dev/firecrawl";
const ENV_LOVABLE = "LOVABLE_API_KEY";
const ENV_CONNECTION = "FIRECRAWL_API_KEY";

type FirecrawlItem = {
  url?: string;
  title?: string;
  description?: string;
  snippet?: string;
  publishedDate?: string;
  date?: string;
};

function toResult(item: FirecrawlItem, hint?: ResultType): ExternalResult | null {
  if (!item.url) return null;
  let domain = item.url;
  try {
    domain = new URL(item.url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
  const published = item.publishedDate ?? item.date;
  return {
    id: `firecrawl:${item.url}`,
    resultType: hint,
    title: item.title ?? item.url,
    description: item.description ?? item.snippet,
    sourceName: domain,
    sourceDomain: domain,
    sourceType: "search-api",
    originalUrl: item.url,
    externalId: item.url,
    publishedAt: published && !Number.isNaN(Date.parse(published)) ? new Date(published).toISOString() : undefined,
  };
}

export const firecrawlProvider: ExternalSearchProvider = {
  id: "firecrawl",
  name: "Firecrawl Search",
  domain: "firecrawl.dev",
  requiredEnv: [ENV_CONNECTION, ENV_LOVABLE],
  enabled: true,
  note: "Websuche über die offizielle Firecrawl-API. Wird über den Lovable-Connector verbunden.",
  missingEnv() {
    return [ENV_CONNECTION, ENV_LOVABLE].filter((name) => !process.env[name]);
  },
  async search(args: ProviderSearchArgs): Promise<ExternalResult[]> {
    const lovableKey = process.env[ENV_LOVABLE];
    const connectionKey = process.env[ENV_CONNECTION];
    if (!lovableKey || !connectionKey) throw new Error("not-configured");

    async function runQuery(query: string, limit: number, hint?: ResultType): Promise<ExternalResult[]> {
      const res = await fetch(`${GATEWAY}/v2/search`, {
        method: "POST",
        signal: args.signal,
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": connectionKey as string,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, limit, sources: ["web"], location: "Germany" }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`Firecrawl search failed [${res.status}]: ${text}`);
        throw new Error(`HTTP ${res.status}`);
      }

      const body = (await res.json()) as {
        success?: boolean;
        error?: string;
        data?: { web?: FirecrawlItem[] } | FirecrawlItem[];
      };
      if (body.success === false) {
        console.error(`Firecrawl search error: ${body.error ?? "unknown"}`);
        throw new Error("Anbieter meldet einen Fehler");
      }

      const items = Array.isArray(body.data) ? body.data : (body.data?.web ?? []);
      return items.map((i) => toResult(i, hint)).filter((r): r is ExternalResult => r !== null);
    }

    // Beide Suchrichtungen abfragen: Arbeitssuchende UND Personal-/Auftragssuche.
    const intents = intentQueries(args.query, args.location, args.intent);
    if (intents.length === 0) return [];

    const perIntent = Math.max(5, Math.ceil(args.pageSize / 2));
    const settled = await Promise.allSettled(
      intents.map((i) => runQuery(i.query, perIntent, i.type)),
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
