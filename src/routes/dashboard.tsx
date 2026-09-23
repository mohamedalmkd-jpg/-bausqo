import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, Bookmark, BriefcaseBusiness, FileText, MessageSquare, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { jobLocationLabel, jobStatusLabels, listMyJobs, type JobRow } from "@/lib/jobs";
import { AppShell } from "@/components/app-shell";
import { MarketCard } from "@/components/market-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { marketItems } from "@/lib/demo-data";
import { useWorkspace, type ApplicationStatus } from "@/lib/workspace-state";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard – BauMatch" },
      { name: "description", content: "Überblick über Aufträge, Bewerbungen und Vorschläge im BauMatch Arbeitsbereich." },
      { property: "og:title", content: "Dashboard – BauMatch" },
      { property: "og:description", content: "Aufträge, Bewerbungen und passende Vorschläge auf einen Blick." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const statusStyles: Record<ApplicationStatus, string> = {
  Neu: "bg-primary/10 text-primary",
  Angesehen: "bg-muted text-muted-foreground",
  "Im Gespräch": "bg-brand-orange/10 text-brand-orange",
  Angenommen: "bg-success/10 text-success",
  Abgelehnt: "bg-destructive/10 text-destructive",
  Abgeschlossen: "bg-muted text-muted-foreground",
};

function DashboardPage() {
  const { applications, saved, contacts, notifications } = useWorkspace();
  const suggestions = marketItems.filter((item) => item.kind === "Mitarbeiter" || item.kind === "Jobs").slice(0, 2);

  const stats = [
    { label: "Bewerbungen", value: applications.length, icon: FileText, to: "/bewerbungen" as const },
    { label: "Matches", value: marketItems.filter((i) => i.match >= 85).length, icon: Sparkles, to: "/matches" as const },
    { label: "Gespeichert", value: saved.length, icon: Bookmark, to: "/gespeichert" as const },
    { label: "Anfragen", value: contacts.length, icon: MessageSquare, to: "/nachrichten" as const },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-orange">Demo-Arbeitsbereich</p>
            <h1 className="mt-2 text-3xl font-extrabold">Guten Tag, Rheinbau Projekt GmbH</h1>
            <p className="mt-2 text-sm text-muted-foreground">Vorschläge sind Beispieldaten. Eigene Aktionen werden lokal in diesem Browser gespeichert.</p>
          </div>
          <Button asChild><Link to="/auftrag/erstellen" search={{ draft: undefined }}>Auftrag erstellen</Link></Button>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, to }) => (
            <Link key={label} to={to} className="rounded-lg border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary"><Icon className="size-5" /></span>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-5 text-3xl font-extrabold">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </Link>
          ))}
        </section>

        <MyJobsOverview />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold">Passende Vorschläge</h2>
              <Link to="/matches" className="text-sm font-bold text-primary">Alle Matches</Link>
            </div>
            <div className="mt-4 space-y-4">
              {suggestions.map((item) => <MarketCard key={item.id} item={item} />)}
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-extrabold">Profil-Vollständigkeit</h2>
              <p className="mt-1 text-sm text-muted-foreground">Vollständige Profile erhalten passendere Vorschläge.</p>
              <Progress value={65} className="mt-5" />
              <p className="mt-3 text-sm font-bold">65 % abgeschlossen</p>
              <Button asChild variant="outline" className="mt-5 w-full"><Link to="/profil">Profil ansehen</Link></Button>
            </section>

            <section className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-extrabold">Letzte Bewerbungen</h2>
              {applications.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">Noch keine Bewerbungen erfasst.</p>
              ) : (
                <ul className="mt-4 divide-y">
                  {applications.slice(0, 3).map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                      <Link to="/markt/$id" params={{ id: String(a.itemId) }} className="min-w-0">
                        <p className="truncate text-sm font-bold">{a.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{a.provider}</p>
                      </Link>
                      <span className={`shrink-0 rounded px-2 py-1 text-xs font-bold ${statusStyles[a.status]}`}>{a.status}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Button asChild variant="ghost" className="mt-4 w-full"><Link to="/bewerbungen">Alle Bewerbungen <ArrowUpRight className="size-4" /></Link></Button>
            </section>

            <section className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-extrabold">Benachrichtigungen</h2>
              <p className="mt-2 text-sm text-muted-foreground">{notifications.length} Meldungen</p>
              <Button asChild variant="outline" className="mt-4 w-full"><Link to="/benachrichtigungen">Center öffnen <BriefcaseBusiness className="size-4" /></Link></Button>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/** Echte Aufträge des angemeldeten Kontos aus der Datenbank. */
function MyJobsOverview() {
  const { user, ready } = useAuth();
  const [jobs, setJobs] = useState<JobRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setJobs([]); return; }
    let active = true;
    listMyJobs(user.id)
      .then((rows) => { if (active) setJobs(rows); })
      .catch((e: Error) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [user]);

  if (!ready) return null;

  return (
    <section className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-extrabold">Meine Aufträge</h2>
        <Link to="/meine-auftraege" className="text-sm font-bold text-primary">Alle verwalten</Link>
      </div>

      {!user && (
        <p className="mt-3 text-sm text-muted-foreground">
          Melden Sie sich an, um eigene Aufträge zu erstellen und zu verwalten.
        </p>
      )}
      {error && <p className="mt-3 text-sm text-destructive">Aufträge konnten nicht geladen werden: {error}</p>}
      {user && !jobs && !error && <p className="mt-3 text-sm text-muted-foreground">Aufträge werden geladen …</p>}
      {user && jobs?.length === 0 && (
        <p className="mt-3 text-sm text-muted-foreground">Noch keine Aufträge erstellt.</p>
      )}

      {jobs && jobs.length > 0 && (
        <ul className="mt-4 divide-y">
          {jobs.slice(0, 5).map((job) => (
            <li key={job.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{job.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {jobLocationLabel(job)} · erstellt am {new Date(job.created_at).toLocaleDateString("de-DE")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-muted px-2 py-1 text-xs font-bold">{jobStatusLabels[job.status]}</span>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/auftrag/$id" params={{ id: job.id }}>Ansehen</Link>
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link to="/auftrag/erstellen" search={{ draft: job.id }}>Bearbeiten</Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
