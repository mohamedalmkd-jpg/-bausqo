import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { MarketCard } from "@/components/market-card";
import { marketItems } from "@/lib/demo-data";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Matches – BauMatch" },
      { name: "description", content: "Vorschläge mit hoher fachlicher und organisatorischer Übereinstimmung." },
      { property: "og:title", content: "Matches – BauMatch" },
      { property: "og:description", content: "Transparent erklärte Übereinstimmungen aus dem Demo-Datensatz." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MatchesPage,
});

function MatchesPage() {
  const items = [...marketItems].filter((i) => i.match >= 85).sort((a, b) => b.match - a.match);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold">Matches</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sortiert nach Übereinstimmung im Demo-Datensatz. Der Wert beschreibt Passung, keine Verifizierung.</p>
        <div className="mt-8 space-y-4">
          {items.map((item) => <MarketCard key={item.id} item={item} />)}
        </div>
      </div>
    </AppShell>
  );
}
