import type { SearchIntent } from "../classify";
import type { ExternalResult, ProviderId, ProviderStatus } from "../types";

/** Argumente, die jede Quelle erhält. Felder ohne Entsprechung werden ignoriert. */
export type ProviderSearchArgs = {
  query: string;
  location: string;
  category: string;
  radiusKm: number;
  page: number;
  pageSize: number;
  /** Was der Nutzer sucht – steuert die Suchvarianten. */
  intent: SearchIntent;
  signal: AbortSignal;
};

/**
 * Einheitliche Schnittstelle für externe Quellen.
 * Neue Anbieter werden nur hier registriert – die Suche selbst bleibt unverändert.
 */
export type ExternalSearchProvider = {
  id: ProviderId;
  name: string;
  domain: string;
  /** Benötigte Umgebungsvariablen; leer = keine nötig. */
  requiredEnv: string[];
  enabled: boolean;
  note: string;
  /** Liefert fehlende Konfigurationswerte (niemals deren Inhalt). */
  missingEnv(): string[];
  search(args: ProviderSearchArgs): Promise<ExternalResult[]>;
};

export function statusOf(provider: ExternalSearchProvider): ProviderStatus {
  const missingEnv = provider.missingEnv();
  return {
    id: provider.id,
    name: provider.name,
    domain: provider.domain,
    requiredEnv: provider.requiredEnv,
    missingEnv,
    configured: missingEnv.length === 0,
    enabled: provider.enabled,
    note: provider.note,
  };
}

/** Führt Aufgaben mit begrenzter Parallelität aus (Rate-Limits der Anbieter schonen). */
export async function throttled<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
  gapMs = 0,
): Promise<PromiseSettledResult<T>[]> {
  const out: PromiseSettledResult<T>[] = new Array(tasks.length);
  let next = 0;
  async function worker() {
    while (next < tasks.length) {
      const index = next++;
      const task = tasks[index];
      if (!task) return;
      try {
        out[index] = { status: "fulfilled", value: await task() };
      } catch (reason) {
        out[index] = { status: "rejected", reason };
      }
      if (gapMs > 0) await new Promise((r) => setTimeout(r, gapMs));
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
  return out;
}
