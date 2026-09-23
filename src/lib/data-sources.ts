import type { ListingSource, SourceType } from "./demo-data";

/**
 * Datenquellen-Architektur für den BauMatch Marktplatz.
 *
 * Grundsatz: Es werden ausschließlich rechtmäßig erhobene Daten angezeigt.
 * Kein Scraping fremder Portale, keine Übernahme geschützter Anzeigen oder
 * personenbezogener Daten ohne Erlaubnis, keine erfundenen Nutzer.
 *
 * Jeder nicht selbst erfasste Eintrag muss Quelle, Quell-URL, Importdatum,
 * externe ID, Ablaufdatum und Rechtsgrundlage mitführen (siehe ListingSource).
 */
export const sourceLabels: Record<SourceType, string> = {
  "baumatch": "BauMatch Mitglied",
  "partner-feed": "Externe Quelle · Partner-Feed",
  "official-api": "Externe Quelle · offizielle API",
  "public-registry": "Externe Quelle · öffentliches Register",
  "manual-onboarding": "Externe Quelle · manuell erfasst",
};

export function isExternal(source: ListingSource): boolean {
  return source.type !== "baumatch";
}

/** Anzeigetext unter jedem Eintrag – externe Einträge sind keine BauMatch-Mitglieder. */
export function sourceNotice(source: ListingSource): string {
  return isExternal(source)
    ? `Quelle: ${source.label} – kein BauMatch-Mitglied.`
    : "Quelle: BauMatch Profil (Demo-Datensatz).";
}

/** Abgelaufene Importe dürfen nicht mehr ausgespielt werden. */
export function isExpired(source: ListingSource, now = new Date()): boolean {
  return Boolean(source.expiresAt && new Date(source.expiresAt) < now);
}
