/**
 * Normalisiertes Format für externe Suchergebnisse.
 *
 * Grundsatz: Felder bleiben leer, wenn die Quelle sie nicht liefert.
 * Es werden keine Werte geraten, ergänzt oder erfunden.
 */
export type ExternalResult = {
  id: string;
  /** Art des Treffers: Arbeitssuchend, Stellenanzeige, Auftrag, Projekt … */
  resultType?: import("./classify").ResultType | undefined;
  title: string;
  description?: string | undefined;
  category?: string | undefined;
  location?: string | undefined;
  postalCode?: string | undefined;
  city?: string | undefined;
  country?: string | undefined;
  publishedAt?: string | undefined;
  sourceName: string;
  sourceDomain: string;
  sourceType: "official-api" | "search-api" | "partner-feed";
  originalUrl: string;
  externalId?: string | undefined;
  imageUrl?: string | undefined;
  salary?: string | undefined;
  budget?: string | undefined;
  contractType?: string | undefined;
  employmentType?: string | undefined;
  /** Reine Such-Relevanz (kein Vertrauens- oder Qualitätswert). */
  relevance?: number | undefined;
  relevanceReasons?: string[] | undefined;
};

export type ProviderId = "arbeitsagentur" | "google-cse" | "firecrawl" | "brave";

export type ProviderStatus = {
  id: ProviderId;
  name: string;
  domain: string;
  /** Welche Umgebungsvariablen die Quelle benötigt. Leer = keine nötig. */
  requiredEnv: string[];
  missingEnv: string[];
  configured: boolean;
  enabled: boolean;
  note: string;
};

export type ProviderOutcome = {
  provider: ProviderId;
  name: string;
  ok: boolean;
  configured: boolean;
  /** Fehlermeldung ohne technische Interna / ohne Secrets. */
  error?: string | undefined;
  count: number;
  durationMs: number;
  cached: boolean;
};

/** Zähler einer Suche – echte Werte, nur Metadaten. */
export type SearchStats = {
  received: number;
  accepted: number;
  rejected: number;
  duplicates: number;
};

export type ExternalSearchResponse = {
  results: ExternalResult[];
  providers: ProviderOutcome[];
  page: number;
  pageSize: number;
  hasMore: boolean;
  stats: SearchStats;
};

/** Sucht-Relevanz: nur Übereinstimmung der Suchbegriffe, kein Vertrauenswert. */
export function scoreRelevance(
  result: ExternalResult,
  query: string,
  location: string,
  category: string,
): { score: number; reasons: string[] } {
  const haystack = [result.title, result.description, result.category, result.location, result.city]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const reasons: string[] = [];
  let score = 40;

  const terms = query.toLowerCase().split(/[\s,]+/).filter((t) => t.length > 2);
  const hits = terms.filter((t) => haystack.includes(t));
  if (terms.length > 0) {
    score += Math.round((hits.length / terms.length) * 35);
    if (hits.length > 0) reasons.push(`Suchbegriff passt (${hits.join(", ")})`);
  }

  if (location && haystack.includes(location.toLowerCase())) {
    score += 15;
    reasons.push(`Ort passt (${location})`);
  }
  if (category && !category.startsWith("Alle") && haystack.includes(category.toLowerCase())) {
    score += 10;
    reasons.push(`Gewerk passt (${category})`);
  }
  if (result.publishedAt) {
    const days = (Date.now() - new Date(result.publishedAt).getTime()) / 86_400_000;
    if (days >= 0 && days <= 14) {
      score += 5;
      reasons.push("Anzeige ist aktuell");
    }
  }

  return { score: Math.max(1, Math.min(99, score)), reasons };
}
