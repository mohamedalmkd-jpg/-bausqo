import { createFileRoute } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { MarketCard } from "@/components/market-card";
import { Button } from "@/components/ui/button";
import { getMarketItem } from "@/lib/market-utils";
import { useWorkspace } from "@/lib/workspace-state";

export const Route = createFileRoute("/gespeichert")({
  head: () => ({
    meta: [
      { title: "Gespeichert – BauMatch" },
      { name: "description", content: "Gemerkte Jobs, Aufträge, Fachkräfte und Unternehmen." },
      { property: "og:title", content: "Gespeichert – BauMatch" },
      { property: "og:description", content: "Alle gemerkten Einträge an einem Ort." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { saved, hydrated, savedSearches, removeSavedSearch } = useWorkspace();
  const items = saved.map(getMarketItem).filter((x) => x !== undefined);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold">Gespeichert</h1>
        <p className="mt-2 text-sm text-muted-foreground">Gemerkte Einträge und Suchaufträge liegen lokal in diesem Browser.</p>

        {hydrated && savedSearches.length > 0 && (
          <section className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-extrabold">Suchaufträge</h2>
            <p className="mt-1 text-xs text-muted-foreground">Automatische Benachrichtigungen per E-Mail sind erst mit angebundenem Konto möglich.</p>
            <ul className="mt-4 space-y-3">
              {savedSearches.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 border-b pb-3 text-sm">
                  <span><span className="font-bold">{s.label}</span> <span className="text-muted-foreground">· {s.kind}</span></span>
                  <Button size="sm" variant="ghost" onClick={() => removeSavedSearch(s.id)}>Entfernen</Button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-8 space-y-4">
          {!hydrated || items.length === 0 ? (
            <EmptyState icon={Bookmark} title="Noch nichts gespeichert" text="Über „Speichern“ auf einer Karte oder Detailseite landen Einträge hier." actionLabel="Zum Marketplace" />
          ) : items.map((item) => <MarketCard key={item.id} item={item} />)}
        </div>
      </div>
    </AppShell>
  );
}
