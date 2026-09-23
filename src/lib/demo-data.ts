export type MarketKind = "Jobs" | "Mitarbeiter" | "Aufträge" | "Unternehmen";

/** Untertyp für Personen-/Teamprofile – steuert Detail-URL und Kartensymbol. */
export type ProfileType = "worker" | "team";

/**
 * Herkunft eines Eintrags. Externe Einträge dürfen niemals als BauMatch-Mitglieder
 * dargestellt werden – siehe src/lib/data-sources.ts.
 */
export type SourceType = "baumatch" | "partner-feed" | "official-api" | "public-registry" | "manual-onboarding";

export type ListingSource = {
  type: SourceType;
  /** Anzeigename der Quelle, z. B. „BauMatch Mitglied“ oder „Partner-Feed Handwerk24“. */
  label: string;
  url?: string;
  externalId?: string;
  importedAt?: string;
  expiresAt?: string;
  /** Rechtsgrundlage / Freigabe für die Anzeige. */
  permission: "eigene-daten" | "vertrag-partner" | "offizielle-api" | "oeffentlich-zulaessig";
};

export type MarketItem = {
  id: number;
  kind: MarketKind;
  profileType?: ProfileType;
  title: string;
  provider: string;
  location: string;
  postalCode: string;
  state: string;
  distance: string;
  category: string;
  start: string;
  duration: string;
  budget: string;
  people: string;
  description: string;
  match: number;
  verified: boolean;
  lat: number;
  lng: number;
  /** "approx" = nur Stadt-/Gebietsangabe (Privatpersonen, Datenschutz). */
  locationPrecision: "exact" | "approx";
  source: ListingSource;
};

const member: ListingSource = { type: "baumatch", label: "BauMatch Mitglied (Demo)", permission: "eigene-daten" };
const partner: ListingSource = {
  type: "partner-feed",
  label: "Externe Quelle · Partner-Feed (Demo)",
  url: "https://example-partner.test/feed",
  externalId: "DEMO-FEED-001",
  importedAt: "2026-09-12",
  expiresAt: "2026-12-31",
  permission: "vertrag-partner",
};

export const marketItems: MarketItem[] = [
  { id: 1, kind: "Jobs", title: "Elektriker für Gewerbeausbau", provider: "Rheinbau Projekt GmbH", location: "Köln", postalCode: "50667", state: "Nordrhein-Westfalen", distance: "24 km", category: "Elektrotechnik", start: "05.10.2026", duration: "4 Monate", budget: "24–30 €/Std.", people: "4 Fachkräfte", description: "Installation und Prüfung der Gebäudetechnik in einem modernen Bürokomplex.", match: 94, verified: false, lat: 50.9375, lng: 6.9603, locationPrecision: "exact", source: member },
  { id: 2, kind: "Jobs", title: "Trockenbauer im Innenausbau", provider: "Hanse Projektbau GmbH", location: "Hamburg", postalCode: "20095", state: "Hamburg", distance: "12 km", category: "Trockenbau", start: "12.10.2026", duration: "8 Wochen", budget: "22–28 €/Std.", people: "6 Fachkräfte", description: "Innenausbau von 38 Wohneinheiten, Material und Bauleitung vor Ort.", match: 88, verified: false, lat: 53.5511, lng: 9.9937, locationPrecision: "exact", source: member },
  { id: 3, kind: "Mitarbeiter", profileType: "team", title: "Maler-Team Müller", provider: "Teamprofil · Demo", location: "Berlin", postalCode: "10115", state: "Berlin", distance: "31 km", category: "Malerarbeiten", start: "01.10.2026", duration: "bis 6 Monate", budget: "Auf Anfrage", people: "8 Mitarbeiter", description: "Eingespieltes Team für Innen- und Fassadenarbeiten im Großraum Berlin.", match: 91, verified: false, lat: 52.52, lng: 13.405, locationPrecision: "approx", source: member },
  { id: 4, kind: "Mitarbeiter", profileType: "worker", title: "Daniel Krüger · Schweißer", provider: "Fachkraftprofil · Demo", location: "Dortmund", postalCode: "44135", state: "Nordrhein-Westfalen", distance: "18 km", category: "Metallbau", start: "Sofort", duration: "Flexibel", budget: "29 €/Std.", people: "1 Fachkraft", description: "10 Jahre Erfahrung im Stahlbau, MAG/WIG-Qualifikationen hinterlegt.", match: 86, verified: false, lat: 51.5136, lng: 7.4653, locationPrecision: "approx", source: member },
  { id: 5, kind: "Aufträge", title: "Rohbau Mehrfamilienhaus", provider: "Weststadt Immobilienbau", location: "Düsseldorf", postalCode: "40213", state: "Nordrhein-Westfalen", distance: "42 km", category: "Maurerarbeiten", start: "02.11.2026", duration: "7 Monate", budget: "180.000–240.000 €", people: "12 Personen", description: "Rohbauleistung für 24 Wohneinheiten inklusive Baustelleneinrichtung.", match: 92, verified: false, lat: 51.2277, lng: 6.7735, locationPrecision: "exact", source: member },
  { id: 6, kind: "Aufträge", title: "Dachsanierung Logistikhalle", provider: "Nordtor Gewerbebau", location: "Bremen", postalCode: "28195", state: "Bremen", distance: "66 km", category: "Dachdecker", start: "19.10.2026", duration: "10 Wochen", budget: "85.000–110.000 €", people: "6 Personen", description: "Energetische Sanierung einer 4.200 m² großen Hallendachfläche.", match: 79, verified: false, lat: 53.0793, lng: 8.8017, locationPrecision: "exact", source: member },
  { id: 7, kind: "Unternehmen", title: "Kern & Sohn Gebäudetechnik", provider: "Subunternehmer · Demo", location: "Frankfurt am Main", postalCode: "60311", state: "Hessen", distance: "15 km", category: "SHK", start: "Ab Oktober", duration: "Projektbezogen", budget: "Auf Anfrage", people: "34 Mitarbeiter", description: "Fachbetrieb für Heizung, Sanitär und Klima im Gewerbe- und Wohnungsbau.", match: 90, verified: false, lat: 50.1109, lng: 8.6821, locationPrecision: "exact", source: member },
  { id: 8, kind: "Unternehmen", title: "Elbe Ausbau GmbH", provider: "Bauunternehmen · Demo", location: "Leipzig", postalCode: "04109", state: "Sachsen", distance: "54 km", category: "Innenausbau", start: "Kapazität frei", duration: "Flexibel", budget: "Auf Anfrage", people: "22 Mitarbeiter", description: "Innenausbau, Trockenbau und Bodenarbeiten für gewerbliche Auftraggeber.", match: 83, verified: false, lat: 51.3397, lng: 12.3731, locationPrecision: "exact", source: partner },
  { id: 9, kind: "Mitarbeiter", profileType: "team", title: "Trockenbau-Team Yildiz", provider: "Teamprofil · Demo", location: "Köln", postalCode: "51063", state: "Nordrhein-Westfalen", distance: "9 km", category: "Trockenbau", start: "01.10.2026", duration: "bis 8 Monate", budget: "Auf Anfrage", people: "8 Mitarbeiter", description: "Team für Trockenbau, Akustikdecken und Innenausbau im Rheinland.", match: 92, verified: false, lat: 50.9662, lng: 7.0112, locationPrecision: "approx", source: member },
  { id: 10, kind: "Mitarbeiter", profileType: "worker", title: "Ayhan Demir · Elektriker", provider: "Fachkraftprofil · Demo", location: "Bonn", postalCode: "53111", state: "Nordrhein-Westfalen", distance: "34 km", category: "Elektrotechnik", start: "Sofort", duration: "Flexibel", budget: "27 €/Std.", people: "1 Fachkraft", description: "Elektroinstallation im Gewerbebau, Prüfprotokolle und Messtechnik.", match: 89, verified: false, lat: 50.7374, lng: 7.0982, locationPrecision: "approx", source: member },
  { id: 11, kind: "Jobs", title: "Fliesenleger Sanierung Klinik", provider: "Süd Ausbau GmbH", location: "Stuttgart", postalCode: "70173", state: "Baden-Württemberg", distance: "88 km", category: "Fliesenarbeiten", start: "26.10.2026", duration: "12 Wochen", budget: "25–31 €/Std.", people: "3 Fachkräfte", description: "Fliesen- und Abdichtungsarbeiten in Sanitärbereichen einer Klinik.", match: 81, verified: false, lat: 48.7758, lng: 9.1829, locationPrecision: "exact", source: member },
  { id: 12, kind: "Aufträge", title: "Innenausbau Bürofläche", provider: "Rheinpark Development", location: "Köln", postalCode: "50823", state: "Nordrhein-Westfalen", distance: "6 km", category: "Innenausbau", start: "10.10.2026", duration: "14 Wochen", budget: "120.000–160.000 €", people: "9 Personen", description: "Ausbau von 1.800 m² Bürofläche inklusive Trockenbau und Bodenbelag.", match: 90, verified: false, lat: 50.9557, lng: 6.9235, locationPrecision: "exact", source: member },
  { id: 13, kind: "Unternehmen", title: "Bauhandwerk Mittelrhein GmbH", provider: "Bauunternehmen · Demo", location: "Koblenz", postalCode: "56068", state: "Rheinland-Pfalz", distance: "78 km", category: "Maurerarbeiten", start: "Kapazität frei", duration: "Projektbezogen", budget: "Auf Anfrage", people: "48 Mitarbeiter", description: "Rohbau, Sanierung und Betonarbeiten für öffentliche und private Auftraggeber.", match: 76, verified: false, lat: 50.3569, lng: 7.5939, locationPrecision: "exact", source: partner },
  { id: 14, kind: "Jobs", title: "Dachdecker Flachdachsanierung", provider: "Nordtor Gewerbebau", location: "Hannover", postalCode: "30159", state: "Niedersachsen", distance: "120 km", category: "Dachdecker", start: "Sofort", duration: "6 Wochen", budget: "26–32 €/Std.", people: "4 Fachkräfte", description: "Abdichtung und Dämmung von Flachdächern auf Gewerbeobjekten.", match: 74, verified: false, lat: 52.3759, lng: 9.732, locationPrecision: "exact", source: member },
];

export const accountTypes = ["Arbeitnehmer", "Selbstständiger", "Arbeitsteam", "Subunternehmer", "Bauunternehmen", "Generalunternehmer", "Projektleiter"];

export const featuredItem: MarketItem = marketItems[0]!;
