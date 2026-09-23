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
      { title: "Dashboard – BAUSQO" },
      { name: "description", content: "BAUSQO Command Center für Aufträge, Matches, Nachrichten und Geschäftschancen." },
      { property: "og:title", content: "Dashboard – BAUSQO" },
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
      <div className="bausqo-page mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="surface-noise relative overflow-hidden rounded-[1.7rem] bg-brand-dark p-6 text-primary-foreground shadow-2xl sm:p-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-300">BUSINESS COMMAND CENTER</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.04em] sm:text-4xl">Alles Wichtige für dein Baugeschäft – an einem Ort.</h1>
            <p className="mt-3 max-w-2xl text-sm text-primary-foreground/60">Aufträge, Matches, Nachrichten und Projekte – priorisiert statt verteilt.</p>
          </div>
          <div className="flex gap-2"><Button asChild className="rounded-xl"><Link to="/auftrag/erstellen" search={{ draft: undefined }}>Auftrag erstellen</Link></Button><Button asChild variant="secondary" className="rounded-xl bg-primary-foreground text-brand-dark"><Link to="/marketplace">Markt durchsuchen</Link></Button></div>
        </div>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, to }) => (
            <Link key={label} to={to} className="premium-panel interaction-lift group rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-5 text-3xl font-black tracking-tight">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </Link>
          ))}
        </section>

        <MyJobsOverview />

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
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
            <section className="premium-panel rounded-2xl p-6">
              <h2 className="text-lg font-extrabold">Profil-Vollständigkeit</h2>
              <p className="mt-1 text-sm text-muted-foreground">Vollständige Profile erhalten passendere Vorschläge.</p>
              <Progress value={65} className="mt-5" />
              <p className="mt-3 text-sm font-bold">65 % abgeschlossen</p>
              <Button asChild variant="outline" className="mt-5 w-full"><Link to="/profil">Profil ansehen</Link></Button>
            </section>

            <section className="premium-panel rounded-2xl p-6">
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

            <section className="premium-panel rounded-2xl p-6">
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
    <section className="mt-8 premium-panel rounded-2xl p-6">
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
