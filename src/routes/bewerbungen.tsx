import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { useWorkspace, type ApplicationStatus } from "@/lib/workspace-state";

export const Route = createFileRoute("/bewerbungen")({
  head: () => ({
    meta: [
      { title: "Bewerbungen – BauMatch" },
      { name: "description", content: "Status aller erfassten Bewerbungen auf Jobs und Bauaufträge." },
      { property: "og:title", content: "Bewerbungen – BauMatch" },
      { property: "og:description", content: "Bewerbungen und ihren Status im Blick behalten." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ApplicationsPage,
});

const statusStyles: Record<ApplicationStatus, string> = {
  Neu: "bg-primary/10 text-primary",
  Angesehen: "bg-muted text-muted-foreground",
  "Im Gespräch": "bg-brand-orange/10 text-brand-orange",
  Angenommen: "bg-success/10 text-success",
  Abgelehnt: "bg-destructive/10 text-destructive",
  Abgeschlossen: "bg-muted text-muted-foreground",
};

function ApplicationsPage() {
  const { applications, hydrated } = useWorkspace();

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold">Bewerbungen</h1>
        <p className="mt-2 text-sm text-muted-foreground">Bewerbungen werden lokal in diesem Browser gespeichert. Der Status ändert sich erst, wenn ein Konto angebunden ist.</p>

        <div className="mt-8 space-y-4">
          {!hydrated || applications.length === 0 ? (
            <EmptyState icon={FileText} title="Noch keine Bewerbungen" text="Öffnen Sie einen Job oder Auftrag im Marketplace und bewerben Sie sich, um hier den Status zu sehen." actionLabel="Zum Marketplace" />
          ) : applications.map((a) => (
            <article key={a.id} className="rounded-lg border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link to="/markt/$id" params={{ id: String(a.itemId) }} className="text-lg font-extrabold hover:text-primary">{a.title}</Link>
                  <p className="mt-1 text-sm text-muted-foreground">{a.provider}</p>
                </div>
                <span className={`rounded px-2 py-1 text-xs font-bold ${statusStyles[a.status]}`}>{a.status}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{a.message}</p>
              <div className="mt-4 flex flex-wrap gap-5 text-xs text-muted-foreground">
                <span>Verfügbar ab: <strong className="text-foreground">{a.availableFrom}</strong></span>
                <span>Erfasst: {new Date(a.createdAt).toLocaleDateString("de-DE")}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
