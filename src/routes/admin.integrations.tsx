import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { adminProviderStatus, testProvider, type ProviderAdminRow } from "@/lib/search.functions";
import type { ProviderOutcome } from "@/lib/search/types";

export const Route = createFileRoute("/admin/integrations")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Integrationen – BauMatch Admin" },
      { name: "description", content: "Status der externen Suchanbieter von BauMatch." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "BauMatch Admin – Integrationen" },
      { property: "og:description", content: "Konfiguration und Status externer Suchquellen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminIntegrationsPage,
});

function fmt(value: string | null) {
  return value ? new Date(value).toLocaleString("de-DE") : "–";
}

function AdminIntegrationsPage() {
  const { ready, user } = useAuth();
  const [rows, setRows] = useState<ProviderAdminRow[] | null>(null);
  const [denied, setDenied] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [tests, setTests] = useState<Record<string, ProviderOutcome | { error: string }>>({});

  async function runTest(id: string) {
    setTesting(id);
    try {
      const outcome = await testProvider({ data: { provider: id } });
      setTests((prev) => ({ ...prev, [id]: outcome }));
    } catch {
      setTests((prev) => ({ ...prev, [id]: { error: "Test konnte nicht ausgeführt werden." } }));
    } finally {
      setTesting(null);
    }
  }

  useEffect(() => {
    if (!ready || !user) return;
    let active = true;
    adminProviderStatus()
      .then((data) => { if (active) setRows(data); })
      .catch(() => { if (active) setDenied(true); });
    return () => { active = false; };
  }, [ready, user]);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-extrabold">Integrationen</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Status der externen Suchquellen. Schlüsselwerte werden hier nie angezeigt.
        </p>

        {!ready && <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Wird geladen …</p>}

        {ready && !user && (
          <p className="mt-6 rounded-lg border p-5 text-sm">Bitte anmelden, um diesen Bereich zu sehen.</p>
        )}

        {denied && (
          <p className="mt-6 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-5 text-sm">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" /> Kein Zugriff – dieser Bereich ist der Rolle „admin“ vorbehalten.
          </p>
        )}

        {rows && (
          <div className="mt-6 space-y-4">
            {rows.map((p) => (
              <article key={p.id} className="rounded-lg border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-extrabold">{p.name}</h2>
                  <span className={`rounded px-2 py-1 text-xs font-bold ${p.configured ? "bg-primary/10 text-primary" : "bg-brand-orange/10 text-brand-orange"}`}>
                    {p.configured ? "Verbunden" : "Nicht konfiguriert"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{p.note}</p>
                <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  <div><dt className="inline font-semibold">Domain: </dt><dd className="inline text-muted-foreground">{p.domain}</dd></div>
                  <div><dt className="inline font-semibold">Benötigte Konfiguration: </dt><dd className="inline text-muted-foreground">{p.requiredEnv.length ? p.requiredEnv.join(", ") : "keine"}</dd></div>
                  <div><dt className="inline font-semibold">Fehlt: </dt><dd className="inline text-muted-foreground">{p.missingEnv.length ? p.missingEnv.join(", ") : "–"}</dd></div>
                  <div><dt className="inline font-semibold">Anfragen (24 h): </dt><dd className="inline text-muted-foreground">{p.requests24h}</dd></div>
                  <div><dt className="inline font-semibold">Anfragen heute: </dt><dd className="inline text-muted-foreground">{p.requestsToday}</dd></div>
                  <div><dt className="inline font-semibold">Ergebnisse empfangen: </dt><dd className="inline text-muted-foreground">{p.received}</dd></div>
                  <div><dt className="inline font-semibold">Ergebnisse übernommen: </dt><dd className="inline text-muted-foreground">{p.accepted}</dd></div>
                  <div><dt className="inline font-semibold">Ergebnisse verworfen: </dt><dd className="inline text-muted-foreground">{p.rejected}</dd></div>
                  <div><dt className="inline font-semibold">Duplikate entfernt: </dt><dd className="inline text-muted-foreground">{p.duplicates}</dd></div>
                  <div><dt className="inline font-semibold">Letzte erfolgreiche Suche: </dt><dd className="inline text-muted-foreground">{fmt(p.lastSuccessAt)}</dd></div>
                  <div><dt className="inline font-semibold">Ergebnisse dabei: </dt><dd className="inline text-muted-foreground">{p.lastResultCount ?? "–"}</dd></div>
                  <div><dt className="inline font-semibold">Letzter Fehler: </dt><dd className="inline text-muted-foreground">{fmt(p.lastErrorAt)}</dd></div>
                  <div><dt className="inline font-semibold">Fehlermeldung: </dt><dd className="inline text-muted-foreground">{p.lastError ?? "–"}</dd></div>
                </dl>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button size="sm" variant="outline" disabled={testing === p.id} onClick={() => void runTest(p.id)}>
                    {testing === p.id ? <Loader2 className="size-4 animate-spin" /> : null} Verbindung testen
                  </Button>
                  {tests[p.id] && (
                    <span className="text-sm text-muted-foreground">
                      {"error" in tests[p.id]!
                        ? (tests[p.id] as { error: string }).error
                        : (tests[p.id] as ProviderOutcome).ok
                          ? `Erfolgreich – ${(tests[p.id] as ProviderOutcome).count} Ergebnisse in ${(tests[p.id] as ProviderOutcome).durationMs} ms`
                          : `Fehlgeschlagen – ${(tests[p.id] as ProviderOutcome).error ?? "unbekannt"}`}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
