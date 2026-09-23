import type { ExternalResult } from "../types";
import type { ExternalSearchProvider, ProviderSearchArgs } from "./provider";

/**
 * Google Programmable Search (Custom Search JSON API – der aktuell unterstützte
 * Nachfolger der abgekündigten „Site Restricted“-API).
 * Erfordert einen eigenen API-Schlüssel und eine Suchmaschinen-ID.
 * Angezeigt werden nur die von Google gelieferten Metadaten/Snippets;
 * verlinkt wird immer auf die Originalseite.
 */
const ENV_KEY = "EXTERNAL_SEARCH_API_KEY";
const ENV_ENGINE = "EXTERNAL_SEARCH_ENGINE_ID";

type CseItem = {
  cacheId?: string;
  title?: string;
  snippet?: string;
  link?: string;
  displayLink?: string;
  pagemap?: { cse_image?: { src?: string }[]; metatags?: Record<string, string>[] };
};

export const googleProvider: ExternalSearchProvider = {
  id: "google-cse",
  name: "Google Programmable Search",
  domain: "googleapis.com",
  requiredEnv: [ENV_KEY, ENV_ENGINE],
  enabled: true,
  note: "Custom Search JSON API. Die Suchmaschine muss in der Programmable-Search-Konsole auf „Search the entire web“ stehen, sonst sind nur eingetragene Seiten durchsuchbar.",
  missingEnv() {
    return [ENV_KEY, ENV_ENGINE].filter((name) => !process.env[name]);
  },
  async search(opts: ProviderSearchArgs): Promise<ExternalResult[]> {
    const key = process.env[ENV_KEY];
    const cx = process.env[ENV_ENGINE];
    if (!key || !cx) throw new Error("not-configured");

    const q = [opts.query, opts.location].filter(Boolean).join(" ");
    const num = Math.min(10, opts.pageSize);
    const start = (opts.page - 1) * num + 1;
    const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(key)}&cx=${encodeURIComponent(cx)}&q=${encodeURIComponent(q)}&num=${num}&start=${start}&hl=de&gl=de`;

    const res = await fetch(url, { signal: opts.signal });
    if (!res.ok) {
      const text = await res.text();
      console.error(`Google CSE failed [${res.status}]: ${text}`);
      throw new Error(`HTTP ${res.status}`);
    }
    const body = (await res.json()) as { items?: CseItem[] };

    return (body.items ?? [])
      .filter((item) => Boolean(item.link))
      .map((item): ExternalResult => {
        const link = item.link!;
        const published = item.pagemap?.metatags?.[0]?.["article:published_time"];
        return {
          id: `google-cse:${item.cacheId ?? link}`,
          title: item.title ?? link,
          description: item.snippet,
          location: opts.location || undefined,
          publishedAt: published,
          sourceName: item.displayLink ?? "Web-Ergebnis",
          sourceDomain: item.displayLink ?? new URL(link).hostname,
          sourceType: "search-api",
          originalUrl: link,
          externalId: item.cacheId,
          imageUrl: item.pagemap?.cse_image?.[0]?.src,
        };
      });
  },
};
