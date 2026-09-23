import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { ExternalSearchResponse, ProviderStatus } from "./search/types";

type SearchInput = {
  query: string;
  location?: string;
  category?: string;
  radiusKm?: number;
  page?: number;
  pageSize?: number;
  sources?: string[];
  intent?: string;
};

const intents = [
  "ALLE", "ARBEITSSUCHEND", "STELLENANZEIGE", "AUFTRAG", "PROJEKT", "SUBUNTERNEHMER", "TEAM", "UNTERNEHMEN",
];

/**
 * Externe Suche. Läuft ausschließlich serverseitig, damit API-Schlüssel
 * niemals im Browser landen.
 */
export const externalSearch = createServerFn({ method: "POST" })
  .inputValidator((input: SearchInput) => ({
    query: String(input.query ?? "").slice(0, 200),
    location: String(input.location ?? "").slice(0, 100),
    category: String(input.category ?? "").slice(0, 100),
    radiusKm: Math.max(0, Math.min(200, Number(input.radiusKm ?? 50))),
    page: Math.max(1, Math.min(10, Number(input.page ?? 1))),
    pageSize: Math.max(1, Math.min(50, Number(input.pageSize ?? 20))),
    sources: Array.isArray(input.sources) ? input.sources.slice(0, 5).map(String) : [],
    intent: intents.includes(String(input.intent ?? "ALLE")) ? String(input.intent ?? "ALLE") : "ALLE",
  }))
  .handler(async ({ data }): Promise<ExternalSearchResponse> => {
    const { runExternalSearch } = await import("./search/registry.server");
    const response = await runExternalSearch({ ...data, intent: data.intent as never });

    // Protokoll für den Admin-Bereich (nur Metadaten, keine Nutzerdaten).
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("search_logs").insert(
        response.providers.map((p) => ({
          provider: p.provider,
          query: data.query,
          location: data.location || null,
          result_count: p.count,
          duration_ms: p.durationMs,
          ok: p.ok,
          error: p.error ?? null,
          received: response.stats.received,
          accepted: response.stats.accepted,
          rejected: response.stats.rejected,
          duplicates: response.stats.duplicates,
        })),
      );
    } catch {
      /* Protokollierung darf die Suche nie blockieren */
    }

    return response;
  });

/** Health-Check einer einzelnen Quelle – nur für Rolle „admin“. */
export const testProvider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { provider: string }) => ({ provider: String(input.provider) }))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { checkProvider } = await import("./search/registry.server");
    const outcome = await checkProvider(data.provider as never);
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("search_logs").insert({
        provider: outcome.provider,
        query: "[health-check] Elektriker Köln",
        location: "Köln",
        result_count: outcome.count,
        duration_ms: outcome.durationMs,
        ok: outcome.ok,
        error: outcome.error ?? null,
      });
    } catch {
      /* Protokoll darf den Test nicht blockieren */
    }
    return outcome;
  });

/** Öffentlicher Konfigurationsstatus – enthält niemals Schlüsselwerte. */
export const publicProviderStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProviderStatus[]> => {
    const { providerStatuses } = await import("./search/registry.server");
    return providerStatuses();
  },
);

export type ProviderAdminRow = ProviderStatus & {
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  lastError: string | null;
  lastResultCount: number | null;
  requests24h: number;
  requestsToday: number;
  received: number;
  accepted: number;
  rejected: number;
  duplicates: number;
};

/** Admin-Übersicht: Status + letzte Aufrufe. Nur für Rolle „admin“. */
export const adminProviderStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ProviderAdminRow[]> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { providerStatuses } = await import("./search/registry.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - 86_400_000).toISOString();
    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
    const sum = (rows: Record<string, unknown>[], key: string) =>
      rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);
    const { data: logs } = await supabaseAdmin
      .from("search_logs")
      .select("provider, ok, error, result_count, created_at, received, accepted, rejected, duplicates")
      .order("created_at", { ascending: false })
      .limit(500);

    return providerStatuses().map((status) => {
      const rows = (logs ?? []).filter((l) => l.provider === status.id);
      const success = rows.find((l) => l.ok);
      const failure = rows.find((l) => !l.ok);
      return {
        ...status,
        lastSuccessAt: success?.created_at ?? null,
        lastErrorAt: failure?.created_at ?? null,
        lastError: failure?.error ?? null,
        lastResultCount: success?.result_count ?? null,
        requests24h: rows.filter((l) => l.created_at >= since).length,
        requestsToday: rows.filter((l) => l.created_at >= startOfDay).length,
        received: sum(rows, "received"),
        accepted: sum(rows, "accepted"),
        rejected: sum(rows, "rejected"),
        duplicates: sum(rows, "duplicates"),
      };
    });
  });
