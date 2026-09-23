import type { ExternalResult } from "../types";
import type { ExternalSearchProvider, ProviderSearchArgs } from "./provider";

/**
 * Offizielle Jobsuche-Schnittstelle der Bundesagentur für Arbeit
 * (https://jobsuche.api.bund.dev – öffentlich dokumentiert, kein eigener Vertrag nötig).
 *
 * Es wird ausschließlich die dokumentierte API genutzt – kein Scraping.
 * Angezeigt werden nur Metadaten; die vollständige Anzeige bleibt auf arbeitsagentur.de.
 */
export const ARBEITSAGENTUR_API_KEY = "jobboerse-jobsuche";
const BASE = "https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/app/jobs";

export const arbeitsagenturProvider: ExternalSearchProvider = {
  id: "arbeitsagentur",
  name: "Bundesagentur für Arbeit – Jobsuche",
  domain: "arbeitsagentur.de",
  requiredEnv: [],
  enabled: true,
  note: "Öffentlich dokumentierte API, kein Schlüssel nötig. Die Schnittstelle antwortet derzeit aus der Lovable-Serverumgebung mit HTTP 403 – Zugangsbeschränkung der Quelle, die nicht umgangen wird.",
  missingEnv: () => [],
  search: (args: ProviderSearchArgs) => searchArbeitsagentur(args),
};

type AaJob = {
  hashId?: string;
  refnr?: string;
  beruf?: string;
  titel?: string;
  arbeitgeber?: string;
  aktuelleVeroeffentlichungsdatum?: string;
  eintrittsdatum?: string;
  arbeitsort?: { ort?: string; plz?: string; region?: string; land?: string };
};

export async function searchArbeitsagentur(opts: {
  query: string;
  location: string;
  radiusKm: number;
  page: number;
  pageSize: number;
  signal: AbortSignal;
}): Promise<ExternalResult[]> {
  const params = new URLSearchParams({
    size: String(opts.pageSize),
    page: String(opts.page),
    angebotsart: "1",
  });
  if (opts.query) params.set("was", opts.query);
  if (opts.location) {
    params.set("wo", opts.location);
    params.set("umkreis", String(Math.max(0, Math.min(200, opts.radiusKm))));
  }

  const res = await fetch(`${BASE}?${params.toString()}`, {
    headers: { "X-API-Key": ARBEITSAGENTUR_API_KEY, Accept: "application/json" },
    signal: opts.signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = (await res.json()) as { stellenangebote?: AaJob[] };

  return (body.stellenangebote ?? []).map((job): ExternalResult => {
    const refnr = job.refnr ?? job.hashId ?? crypto.randomUUID();
    const city = job.arbeitsort?.ort;
    return {
      id: `arbeitsagentur:${refnr}`,
      title: job.titel ?? job.beruf ?? "Stellenangebot",
      description: [job.beruf, job.arbeitgeber].filter(Boolean).join(" · ") || undefined,
      category: job.beruf,
      location: [city, job.arbeitsort?.region].filter(Boolean).join(", ") || undefined,
      postalCode: job.arbeitsort?.plz,
      city,
      country: job.arbeitsort?.land,
      publishedAt: job.aktuelleVeroeffentlichungsdatum,
      sourceName: "Bundesagentur für Arbeit",
      sourceDomain: "arbeitsagentur.de",
      sourceType: "official-api",
      originalUrl: `https://www.arbeitsagentur.de/jobsuche/jobdetail/${encodeURIComponent(refnr)}`,
      externalId: refnr,
      employmentType: "Stellenangebot",
    };
  });
}
