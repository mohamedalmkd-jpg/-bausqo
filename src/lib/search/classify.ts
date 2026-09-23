/**
 * Ergebnistypen der universellen Suche.
 *
 * Wichtig: "ARBEITSSUCHEND" (jemand sucht Arbeit) und "STELLENANZEIGE"
 * (jemand sucht Personal) sind zwei verschiedene Richtungen.
 *
 * Die Einordnung erfolgt ausschließlich aus Titel, Textausschnitt und URL des
 * echten Treffers. Es werden keine Inhalte erfunden oder ergänzt.
 */
export type ResultType =
  | "ARBEITSSUCHEND"
  | "STELLENANZEIGE"
  | "AUFTRAG"
  | "PROJEKT"
  | "SUBUNTERNEHMER"
  | "TEAM"
  | "UNTERNEHMEN";

/** Unklare Treffer – werden aus den Hauptergebnissen ausgeschlossen. */
export type ClassifiedType = ResultType | "OTHER";

/** Was der Nutzer sucht. Steuert Suchanfragen und Reihenfolge. */
export type SearchIntent = "ALLE" | ResultType;

export const resultTypes: ResultType[] = [
  "ARBEITSSUCHEND",
  "STELLENANZEIGE",
  "AUFTRAG",
  "PROJEKT",
  "SUBUNTERNEHMER",
  "TEAM",
  "UNTERNEHMEN",
];

export const resultTypeMeta: Record<ResultType, { label: string; plural: string; dot: string; icon: string; hint: string }> = {
  ARBEITSSUCHEND: { label: "Arbeitssuchend", plural: "Arbeitssuchende", dot: "bg-blue-500", icon: "👷", hint: "Menschen/Teams, die Arbeit suchen" },
  STELLENANZEIGE: { label: "Stellenanzeige", plural: "Mitarbeiter", dot: "bg-green-600", icon: "🏢", hint: "Arbeitgeber suchen Mitarbeiter" },
  AUFTRAG: { label: "Auftrag", plural: "Aufträge", dot: "bg-brand-orange", icon: "📋", hint: "Aufträge und Ausschreibungen" },
  PROJEKT: { label: "Projekt", plural: "Projekte", dot: "bg-purple-500", icon: "🏗️", hint: "Bauprojekte und Bauvorhaben" },
  SUBUNTERNEHMER: { label: "Subunternehmer", plural: "Subunternehmer", dot: "bg-amber-500", icon: "🤝", hint: "Subunternehmer und Nachunternehmer" },
  TEAM: { label: "Team", plural: "Teams", dot: "bg-teal-500", icon: "👥", hint: "Arbeitsteams und Kolonnen" },
  UNTERNEHMEN: { label: "Unternehmen", plural: "Unternehmen", dot: "bg-slate-500", icon: "🏢", hint: "Betriebe und Firmen" },
};

/** Quellen ohne Bezug zu Arbeit, Auftrag oder Bau – werden verworfen. */
const blockedDomains = [
  "pons.com", "dict.cc", "dictionary.cambridge.org", "cambridge.org", "dictionary.com",
  "wikipedia.org", "wiktionary.org", "duden.de", "dict.leo.org", "leo.org", "linguee.de",
  "langenscheidt.com", "reverso.net", "deepl.com", "translate.google.com", "wikihow.com",
  "youtube.com", "tiktok.com", "pinterest.de", "pinterest.com", "amazon.de", "otto.de",
  "ebay.de", "idealo.de", "obi.de", "hornbach.de", "bauhaus.info",
  "spiegel.de", "welt.de", "faz.net", "bild.de", "tagesschau.de", "n-tv.de", "zeit.de",
  "focus.de", "stern.de", "wdr.de", "ard.de", "zdf.de",
];

/** Titel, die auf Lexikon-, Ratgeber- oder Erklärseiten hindeuten. */
const blockedTitle =
  /(übersetzung|wörterbuch|dictionary|translation|synonym|bedeutung von|was ist ein|was macht ein|definition|lexikon|rechtschreibung|englisch-deutsch|deutsch-englisch|steckbrief|berufsbild|ausbildungsinhalte|quiz|test dein)/i;

/** Signale für Arbeit, Auftrag, Bau, Personal. */
const workSignal =
  /(arbeit|job|stelle|stellen|beschäftigung|anstellung|auftrag|auftraege|aufträge|projekt|bauvorhaben|subunternehmer|nachunternehmer|kolonne|team|trupp|mitarbeiter|personal|fachkraft|fachkräfte|monteur|handwerk|bau|gewerk|betrieb|firma|gmbh|innung|dienstleist|angebot|bewerb|gesucht|sucht|suche|verfügbar|kapazität|vermittlung|kleinanzeige|freelanc|selbständig|selbstständig)/i;

const seeking =
  /(sucht\s+(arbeit|stelle|job|auftrag|aufträge|anstellung|beschäftigung|tätigkeit)|suche\s+(arbeit|stelle|job|auftrag|aufträge|anstellung)|arbeit(s|)suchend|jobsuchend|stellengesuch|stellengesuche|arbeitsgesuch|jobgesuch|s-stellengesuche|biete\s+(meine|arbeit|dienstleistung|handwerk)|freie kapazitäten|verfügbar ab|übernehme aufträge|suche neue auftraggeber|suchen neue auftraggeber|sucht auftraggeber)/i;

const teamWord = /(team|kolonne|montagetrupp|trupp|bautrupp|arbeitsgruppe)/i;
const subWord = /(subunternehmer|nachunternehmer|subunternehmen|sub-unternehmer)/i;
const jobAd =
  /(gesucht|stellenangebot|stellenanzeige|jobs?\b|stelle\b|stellen\b|m\/w\/d|w\/m\/d|vollzeit|teilzeit|minijob|festanstellung|wir stellen ein|bewerbung|karriere|arbeitgeber)/i;
const orderWord = /(auftrag|aufträge|ausschreibung|angebot einholen|handwerker gesucht|dienstleistung gesucht|angebote vergleichen)/i;
const projectWord = /(projekt|bauvorhaben|bauprojekt|neubau|sanierung|bauleitung|baustelle)/i;
const companyWord = /(gmbh|gbr|kg\b|e\.k\.|firma|betrieb|meisterbetrieb|innung|handwerkskammer|branchenbuch|firmenverzeichnis|unternehmen)/i;

export type ClassifyInput = { title: string; description?: string | undefined; url: string };

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

/**
 * Prüft, ob ein Treffer überhaupt zur Bau-/Arbeitswelt gehört.
 * Wörterbücher, Wikipedia, Nachrichten und Erklärseiten werden verworfen.
 */
export function isRelevantResult(input: ClassifyInput, professionTerms: string[]): boolean {
  const domain = domainOf(input.url);
  if (!domain) return false;
  if (blockedDomains.some((d) => domain === d || domain.endsWith(`.${d}`))) return false;

  const text = `${input.title} ${input.description ?? ""}`;
  if (blockedTitle.test(text)) return false;
  if (!workSignal.test(`${text} ${input.url}`)) return false;

  const haystack = `${text} ${input.url}`.toLowerCase();
  const terms = professionTerms.filter((t) => t.length > 3).map((t) => t.toLowerCase());
  if (terms.length > 0 && !terms.some((t) => haystack.includes(t.slice(0, Math.max(4, t.length - 2))))) {
    // Kein Bezug zum gesuchten Gewerk – nur zulassen, wenn klarer Bau-Bezug besteht.
    if (!/(bau|handwerk|gewerk|subunternehmer|montage)/i.test(haystack)) return false;
  }
  return true;
}

/** Ordnet einen echten Treffer einem Ergebnistyp zu. */
export function classifyResult(input: ClassifyInput, hint?: ResultType): ClassifiedType {
  const text = `${input.title} ${input.description ?? ""} ${input.url}`;

  if (seeking.test(text)) {
    if (subWord.test(text)) return "SUBUNTERNEHMER";
    if (teamWord.test(text)) return "TEAM";
    return "ARBEITSSUCHEND";
  }
  if (subWord.test(text)) return "SUBUNTERNEHMER";
  if (jobAd.test(text)) return "STELLENANZEIGE";
  if (orderWord.test(text)) return "AUFTRAG";
  if (projectWord.test(text)) return "PROJEKT";
  if (teamWord.test(text)) return "TEAM";
  // Die Suchabsicht darf einen Treffer nur dann als „Arbeitssuchend“ führen,
  // wenn der Text selbst ein Gesuch andeutet – sonst bleibt es ein Unternehmen.
  if (hint === "ARBEITSSUCHEND" && !/(sucht|suche|gesuch|biete|verfügbar)/i.test(text)) {
    return companyWord.test(text) ? "UNTERNEHMEN" : "OTHER";
  }
  if (companyWord.test(text)) return "UNTERNEHMEN";
  return "OTHER";
}

/**
 * Suchvarianten je Ergebnistyp. `{b}` = Gewerk/Suchbegriff, `{o}` = Ort.
 * Es sind echte Suchanfragen – sie werden dem Nutzer nicht angezeigt.
 */
const intentTemplates: Record<ResultType, string[]> = {
  ARBEITSSUCHEND: [
    `"{b} sucht Arbeit" {o}`,
    `"{b} sucht Stelle" OR "{b} arbeitssuchend" {o}`,
    `{b} Stellengesuch {o}`,
    `"{b} verfügbar" OR "{b} sucht Auftrag" {o}`,
    `{b} selbstständig verfügbar {o}`,
  ],
  STELLENANZEIGE: [
    `{b} gesucht {o}`,
    `{b} Stellenangebot {o}`,
    `{b} Mitarbeiter gesucht {o}`,
    `{b} Fachkraft gesucht Vollzeit {o}`,
  ],
  AUFTRAG: [
    `{b} Auftrag {o}`,
    `{b} Ausschreibung {o}`,
    `{b} Arbeiten Auftrag vergeben {o}`,
  ],
  PROJEKT: [
    `{b} Bauprojekt {o}`,
    `{b} Bauvorhaben Projekt {o}`,
  ],
  SUBUNTERNEHMER: [
    `{b} Subunternehmer {o}`,
    `Subunternehmer {b} gesucht {o}`,
    `{b} Nachunternehmer freie Kapazitäten {o}`,
  ],
  TEAM: [
    `"{b} Team sucht Arbeit" OR "{b} Kolonne sucht Auftrag" {o}`,
    `{b} Kolonne {o}`,
    `{b} Montageteam {o}`,
  ],
  UNTERNEHMEN: [
    `{b} Firma {o}`,
    `{b} Meisterbetrieb {o}`,
    `{b} Unternehmen Bau {o}`,
  ],
};

/**
 * Suchabsichten: Aus „Elektriker Köln“ werden echte Suchanfragen für beide
 * Richtungen (Arbeitssuchende und Personal-/Auftragssuchende) gebildet.
 * Bei einer gewählten Absicht wird gezielt tiefer in dieser Richtung gesucht.
 */
export function intentQueries(
  query: string,
  location: string,
  intent: SearchIntent = "ALLE",
): { type: ResultType; query: string }[] {
  const base = query.trim();
  const ort = location.trim();
  if (!base) return [];

  const build = (tpl: string) => tpl.replace(/\{b\}/g, base).replace(/\{o\}/g, ort).replace(/\s+/g, " ").trim();

  if (intent !== "ALLE") {
    return intentTemplates[intent].map((tpl) => ({ type: intent, query: build(tpl) }));
  }

  // „Alles“: breite Abdeckung – die wichtigsten Varianten je Richtung.
  const perType: Record<ResultType, number> = {
    ARBEITSSUCHEND: 3,
    STELLENANZEIGE: 2,
    AUFTRAG: 2,
    PROJEKT: 1,
    SUBUNTERNEHMER: 2,
    TEAM: 1,
    UNTERNEHMEN: 1,
  };
  return resultTypes.flatMap((type) =>
    intentTemplates[type].slice(0, perType[type]).map((tpl) => ({ type, query: build(tpl) })),
  );
}
