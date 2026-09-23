import { marketItems, type MarketItem, type MarketKind } from "./demo-data";

export type SortKey = "Relevanz" | "Match %" | "Entfernung" | "Neueste";

export type MarketFilters = {
  kind: MarketKind;
  query: string;
  category: string;
  location: string;
  radiusKm: number;
  availability: string[];
};

export const ALL_CATEGORIES = "Alle Gewerke";

export const availabilityOptions = ["Sofort verfügbar", "Mit festem Starttermin"] as const;

export const categoryOptions = [ALL_CATEGORIES, ...Array.from(new Set(marketItems.map((i) => i.category))).sort()];

export const knownCities = Array.from(new Set(marketItems.map((i) => i.location)));

/** Suchbegriffe → Gewerk. Basis für spätere natürlichsprachliche Suche. */
const tradeSynonyms: Record<string, string> = {
  elektriker: "Elektrotechnik",
  elektro: "Elektrotechnik",
  elektrotechnik: "Elektrotechnik",
  trockenbauer: "Trockenbau",
  trockenbau: "Trockenbau",
  maler: "Malerarbeiten",
  malerarbeiten: "Malerarbeiten",
  maurer: "Maurerarbeiten",
  maurerarbeiten: "Maurerarbeiten",
  rohbau: "Maurerarbeiten",
  dachdecker: "Dachdecker",
  dach: "Dachdecker",
  schweißer: "Metallbau",
  schweisser: "Metallbau",
  metallbau: "Metallbau",
  stahlbau: "Metallbau",
  installateur: "SHK",
  sanitär: "SHK",
  shk: "SHK",
  heizung: "SHK",
  fliesenleger: "Fliesenarbeiten",
  fliesen: "Fliesenarbeiten",
  innenausbau: "Innenausbau",
};

export type ParsedQuery = { category?: string | undefined; location?: string | undefined; rest: string };

/** „Trockenbauer Köln“ → { category: "Trockenbau", location: "Köln" } */
export function parseQuery(raw: string): ParsedQuery {
  const tokens = raw.trim().split(/[\s,]+/).filter(Boolean);
  let category: string | undefined;
  let location: string | undefined;
  const rest: string[] = [];

  for (const token of tokens) {
    const key = token.toLowerCase();
    const city = knownCities.find((c) => c.toLowerCase() === key || c.toLowerCase().startsWith(key) && key.length >= 4);
    if (!category && tradeSynonyms[key]) {
      category = tradeSynonyms[key];
      continue;
    }
    if (!location && city) {
      location = city;
      continue;
    }
    rest.push(token);
  }
  return { category, location, rest: rest.join(" ") };
}

export function parseDistanceKm(distance: string): number {
  const match = /(\d+)/.exec(distance);
  return match ? Number(match[1]) : 0;
}

export function hasFixedStartDate(start: string): boolean {
  return /\d{2}\.\d{2}\.\d{4}/.test(start);
}

export function getMarketItem(id: number): MarketItem | undefined {
  return marketItems.find((i) => i.id === id);
}

function applyFilters(filters: MarketFilters, radiusKm: number): MarketItem[] {
  const parsed = parseQuery(filters.query);
  const q = parsed.rest.trim().toLowerCase();
  const category = filters.category !== ALL_CATEGORIES ? filters.category : parsed.category;
  const loc = (filters.location.trim() || parsed.location || "").toLowerCase();

  return marketItems.filter((item) => {
    if (item.kind !== filters.kind) return false;
    if (q && !`${item.title} ${item.provider} ${item.location} ${item.postalCode} ${item.category} ${item.description}`.toLowerCase().includes(q)) return false;
    if (category && item.category !== category) return false;
    if (loc && !`${item.location} ${item.postalCode} ${item.state}`.toLowerCase().includes(loc)) return false;
    if (parseDistanceKm(item.distance) > radiusKm) return false;
    if (filters.availability.length > 0) {
      const fixed = hasFixedStartDate(item.start);
      const matches = filters.availability.some((a) => (a === "Sofort verfügbar" ? !fixed : fixed));
      if (!matches) return false;
    }
    return true;
  });
}

function sortItems(items: MarketItem[], sort: SortKey): MarketItem[] {
  const sorted = [...items];
  if (sort === "Match %") sorted.sort((a, b) => b.match - a.match);
  if (sort === "Entfernung") sorted.sort((a, b) => parseDistanceKm(a.distance) - parseDistanceKm(b.distance));
  if (sort === "Neueste") sorted.sort((a, b) => b.id - a.id);
  return sorted;
}

export function filterAndSort(filters: MarketFilters, sort: SortKey): MarketItem[] {
  return sortItems(applyFilters(filters, filters.radiusKm), sort);
}

export const radiusSteps = [20, 50, 100, 200];

export type SearchResult = {
  exact: MarketItem[];
  /** Treffer, die erst mit erweitertem Umkreis sichtbar werden. */
  nearby: MarketItem[];
  nearbyRadius: number | null;
  /** Fachlich passende Einträge in anderen Regionen, wenn der Ort keine Treffer liefert. */
  similar: MarketItem[];
  parsed: ParsedQuery;
};

export function searchMarket(filters: MarketFilters, sort: SortKey): SearchResult {
  const exact = sortItems(applyFilters(filters, filters.radiusKm), sort);
  const parsed = parseQuery(filters.query);
  const base = { exact, nearby: [] as MarketItem[], nearbyRadius: null, similar: [] as MarketItem[], parsed };
  if (exact.length > 0) return base;

  for (const step of radiusSteps) {
    if (step <= filters.radiusKm) continue;
    const wider = applyFilters(filters, step);
    if (wider.length > 0) return { ...base, nearby: sortItems(wider, sort), nearbyRadius: step };
  }

  // Ort lockern, Gewerk behalten – so bleibt der Marktplatz nie leer, ohne Treffer vorzutäuschen.
  const withoutLocation = applyFilters({ ...filters, location: "", query: parsed.category ?? parsed.rest }, 200);
  if (withoutLocation.length > 0) return { ...base, similar: sortItems(withoutLocation, sort) };
  return base;
}

export function matchReasons(item: MarketItem): string[] {
  return [
    `Fachgebiet: ${item.category}`,
    `Entfernung: ${item.distance}`,
    `Start: ${item.start}`,
    `Dauer: ${item.duration}`,
    `Kapazität: ${item.people}`,
  ];
}

export function detailHeadline(kind: MarketKind): string {
  if (kind === "Jobs") return "Stellenangebot";
  if (kind === "Mitarbeiter") return "Profil";
  if (kind === "Aufträge") return "Bauauftrag";
  return "Unternehmensprofil";
}

export type ItemLink = { to: "/jobs/$id" | "/projects/$id" | "/companies/$id" | "/teams/$id" | "/workers/$id"; params: { id: string } };

/** Kanonische, teilbare URL je Eintragstyp. */
export function itemLink(item: MarketItem): ItemLink {
  const params = { id: String(item.id) };
  if (item.kind === "Jobs") return { to: "/jobs/$id", params };
  if (item.kind === "Aufträge") return { to: "/projects/$id", params };
  if (item.kind === "Unternehmen") return { to: "/companies/$id", params };
  return { to: item.profileType === "worker" ? "/workers/$id" : "/teams/$id", params };
}

export function itemHref(item: MarketItem): string {
  return itemLink(item).to.replace("$id", String(item.id));
}

/** Kartenanzeige: Privatprofile nur ungefähr verorten. */
export function mapLabel(item: MarketItem): string {
  return item.locationPrecision === "approx" ? `${item.location} (ungefährer Bereich)` : item.location;
}

export function markerEmoji(item: MarketItem): string {
  if (item.kind === "Jobs") return "📋";
  if (item.kind === "Aufträge") return "🏗️";
  if (item.kind === "Unternehmen") return "🏢";
  return item.profileType === "worker" ? "👷" : "👥";
}
