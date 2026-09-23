import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Building2,
  FileText,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
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
      { name: "description", content: "BAUSQO Command Center für Aufträge, Matches, Nachrichten und Projekte." },
      { property: "og:title", content: "Dashboard – BAUSQO" },
      { property: "og:description", content: "Geschäftschancen und Projekte auf einen Blick." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const statusStyles: Record<ApplicationStatus, string> = {
  Neu: "bg-primary/10 text-primary",
  Angesehen: "bg-muted text-muted-foreground",
  "Im Gespräch": "bg-amber-50 text-amber-700",
  Angenommen: "bg-emerald-50 text-emerald-700",
  Abgelehnt: "bg-red-50 text-red-700",
  Abgeschlossen: "bg-muted text-muted-foreground",
};

function DashboardPage() {
  const { applications, saved, contacts, notifications } = useWorkspace();
  const suggestions = marketItems.filter((item) => item.kind === "Mitarbeiter" || item.kind === "Jobs").slice(0, 2);

  const stats = [
    { label: "Bewerbungen", value: applications.length, icon: FileText, to: "/bewerbungen" as const, helper: "Pipeline" },
    { label: "Top Matches", value: marketItems.filter((i) => i.match >= 85).length, icon: Sparkles, to: "/matches" as const, helper: "≥ 85 % Match" },
    { label: "Gespeichert", value: saved.length, icon: Bookmark, to: "/gespeichert" as const, helper: "Merkliste" },
    { label: "Kontakte", value: contacts.length, icon: MessageSquare, to: "/nachrichten" as const, helper: notifications.length + " Hinweise" },
  ];

  return (
    <AppShell>
      <div className="bausqo-page mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="bausqo-grid-dark relative overflow-hidden rounded-[1.7rem] bg-brand-dark p-6 text-white shadow-2xl sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full bg-primary/18 blur-3xl" />
          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-primary">Business Command Center</span>
                <span className="bausqo-live flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-[9px] font-black text-emerald-300">
                  <i className="size-1.5 rounded-full bg-emerald-300" />
                  Live
                </span>
              </div>
              <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-[-0.045em] sm:text-4xl">Alles Wichtige für dein Baugeschäft – priorisiert.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/52 sm:text-base">Aufträge, Matches, Nachrichten und Projekte in einem klaren Arbeitsbereich statt in vielen einzelnen Seiten.</p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Button asChild size="lg" className="h-12 rounded-xl px-5 font-black text-brand-dark">
                  <Link to="/auftrag/erstellen" search={{ draft: undefined }}><Plus className="size-4" /> Auftrag erstellen</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                  <Link to="/marketplace"><Search className="size-4" /> Markt durchsuchen</Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
              <div className="rounded-xl bg-white/[0.04] p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/30">Markt</p>
                <p className="mt-2 text-3xl font-black">2.481</p>
                <p className="mt-1 text-[10px] text-white/35">aktive Chancen</p>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/30">Top Match</p>
                <p className="mt-2 text-3xl font-black text-primary">94%</p>
                <p className="mt-1 text-[10px] text-white/35">aktuelle Empfehlung</p>
              </div>
              <div className="col-span-2 flex items-center justify-between rounded-xl bg-white/[0.04] p-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/30">Aktivität</p>
                  <p className="mt-1 text-sm font-black">+18 % neue Möglichkeiten</p>
                </div>
                <TrendingUp className="size-5 text-emerald-300" />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, to, helper }) => (
            <Link key={label} to={to} className="bausqo-panel bausqo-lift group rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span>
                <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <p className="mt-5 text-3xl font-black tracking-[-0.04em]">{value}</p>
              <p className="mt-1 text-sm font-black">{label}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{helper}</p>
            </Link>
          ))}
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
          <div className="space-y-6">
            <MyJobsOverview />

            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-primary">Smart Discovery</p>
                  <h2 className="mt-1 text-xl font-black">Passende Vorschläge</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Die relevantesten Chancen zuerst.</p>
                </div>
                <Link to="/matches" className="hidden items-center gap-2 text-sm font-black text-primary sm:flex">Alle Matches <ArrowRight className="size-4" /></Link>
              </div>
              <div className="space-y-4">{suggestions.map((item) => <MarketCard key={item.id} item={item} />)}</div>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="bausqo-panel rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">Profil-Stärke</p>
                  <h2 className="mt-1 text-lg font-black">65 % vollständig</h2>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[9px] font-black text-primary">+ Match</span>
              </div>
              <Progress value={65} className="mt-5" />
              <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                <span className="rounded-xl bg-muted/45 px-3 py-2">Firmenbeschreibung ergänzen</span>
                <span className="rounded-xl bg-muted/45 px-3 py-2">Gewerke bestätigen</span>
                <span className="rounded-xl bg-muted/45 px-3 py-2">Regionen hinzufügen</span>
              </div>
              <Button asChild variant="outline" className="mt-5 w-full rounded-xl"><Link to="/profil">Profil verbessern</Link></Button>
            </section>

            <section className="bausqo-panel rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">Pipeline</p>
                  <h2 className="mt-1 text-lg font-black">Bewerbungen</h2>
                </div>
                <FileText className="size-5 text-primary" />
              </div>
              {applications.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Noch keine Bewerbungen erfasst.</div>
              ) : (
                <ul className="mt-4 space-y-2">
                  {applications.slice(0, 4).map((a) => (
                    <li key={a.id} className="rounded-xl bg-muted/35 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <Link to="/markt/$id" params={{ id: String(a.itemId) }} className="min-w-0">
                          <p className="truncate text-sm font-black">{a.title}</p>
                          <p className="truncate text-[10px] text-muted-foreground">{a.provider}</p>
                        </Link>
                        <span className={"shrink-0 rounded-full px-2 py-1 text-[9px] font-black " + statusStyles[a.status]}>{a.status}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Button asChild variant="ghost" className="mt-3 w-full rounded-xl"><Link to="/bewerbungen">Pipeline öffnen <ArrowUpRight className="size-4" /></Link></Button>
            </section>

            <section className="rounded-2xl bg-brand-dark p-5 text-white shadow-xl">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/12 text-primary"><Building2 className="size-5" /></span>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30">Business Workspace</p>
                  <p className="mt-1 text-sm font-black">Rheinbau Projekt GmbH</p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-5 text-white/40">Ein zentraler Arbeitsbereich für Projekte, Kontakte und neue Geschäftschancen.</p>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

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
    <section className="bausqo-panel rounded-[1.4rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">Meine Projekte</p>
          <h2 className="mt-1 text-xl font-black">Aufträge verwalten</h2>
        </div>
        <Link to="/meine-auftraege" className="text-sm font-black text-primary">Alle verwalten</Link>
      </div>

      {!user && <div className="mt-4 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Melde dich an, um eigene Aufträge zu verwalten.</div>}
      {error && <p className="mt-4 text-sm text-destructive">Aufträge konnten nicht geladen werden: {error}</p>}
      {user && !jobs && !error && <p className="mt-4 text-sm text-muted-foreground">Aufträge werden geladen …</p>}
      {user && jobs?.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed p-5">
          <p className="font-black">Noch keine Aufträge erstellt.</p>
          <p className="mt-1 text-sm text-muted-foreground">Erstelle deinen ersten Auftrag und starte deinen Workspace.</p>
          <Button asChild className="mt-4 rounded-xl"><Link to="/auftrag/erstellen" search={{ draft: undefined }}><Plus className="size-4" /> Auftrag erstellen</Link></Button>
        </div>
      )}

      {jobs && jobs.length > 0 && (
        <div className="mt-5 grid gap-3">
          {jobs.slice(0, 5).map((job) => (
            <div key={job.id} className="rounded-xl border bg-muted/25 p-4 transition-colors hover:bg-muted/45">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">{job.title}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{jobLocationLabel(job)} · {new Date(job.created_at).toLocaleDateString("de-DE")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-background px-2.5 py-1 text-[9px] font-black">{jobStatusLabels[job.status]}</span>
                  <Button size="sm" variant="outline" className="rounded-xl" asChild><Link to="/auftrag/$id" params={{ id: job.id }}>Ansehen</Link></Button>
                  <Button size="sm" variant="ghost" className="rounded-xl" asChild><Link to="/auftrag/erstellen" search={{ draft: job.id }}>Bearbeiten</Link></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
