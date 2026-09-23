import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Inbox, Loader2, Pause, Pencil, Play, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/lib/auth";
import {
  applicationsForJob,
  deleteJob,
  jobStatusLabels,
  listMyJobs,
  setApplicationStatus,
  updateJob,
  type ApplicationRow,
  type JobRow,
  type JobStatus,
} from "@/lib/jobs";

export const Route = createFileRoute("/meine-auftraege")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Meine Aufträge · BAUSQO" },
      { name: "description", content: "Verwalten Sie Ihre Bauaufträge: Entwürfe, veröffentlichte Aufträge, Pausen und eingegangene Bewerbungen." },
      { property: "og:title", content: "Meine Aufträge · BAUSQO" },
      { property: "og:description", content: "Aufträge und Bewerbungen verwalten." },
    ],
  }),
  component: MyJobsPage,
});

const tabs: JobStatus[] = ["draft", "published", "paused", "completed"];

function MyJobsPage() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobRow[] | null>(null);
  const [applications, setApplications] = useState<Record<string, ApplicationRow[]>>({});
  const [tab, setTab] = useState<JobStatus>("published");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const rows = await listMyJobs(user.id);
      setJobs(rows);
      const entries = await Promise.all(rows.map(async (j) => [j.id, await applicationsForJob(j.id)] as const));
      setApplications(Object.fromEntries(entries));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [user]);

  useEffect(() => {
    if (ready && !user) void navigate({ to: "/auth", search: { redirect: "/meine-auftraege", mode: "signin" }, replace: true });
  }, [ready, user, navigate]);

  useEffect(() => { void load(); }, [load]);

  if (!ready || !user || (!jobs && !error)) {
    return <AppShell><div className="grid h-64 place-items-center text-muted-foreground"><Loader2 className="animate-spin" /></div></AppShell>;
  }

  if (error) {
    return (
      <AppShell>
        <EmptyState icon={AlertTriangle} title="Aufträge konnten nicht geladen werden" text={error} />
        <Button className="mt-4" onClick={() => void load()}>Erneut versuchen</Button>
      </AppShell>
    );
  }

  const list = (jobs ?? []).filter((j) => j.status === tab);

  return (
    <AppShell>
      <div className="bausqo-grid-dark relative overflow-hidden rounded-[1.6rem] bg-brand-dark p-6 text-white shadow-2xl sm:p-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">Meine Aufträge</h1>
        <Button asChild className="rounded-xl font-black text-brand-dark"><Link to="/auftrag/erstellen" search={{ draft: undefined }}><Plus /> Auftrag erstellen</Link></Button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 rounded-2xl border bg-card p-1.5 shadow-sm">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`h-10 rounded-xl px-4 text-sm font-black transition-all ${tab === t ? "bg-brand-dark text-white shadow-lg" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
          >
            {jobStatusLabels[t]} ({(jobs ?? []).filter((j) => j.status === t).length})
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4">
        {list.length === 0 && (
          <EmptyState
            icon={Inbox}
            title="Keine Aufträge in diesem Status"
            text="Erstellen Sie einen neuen Auftrag oder wechseln Sie den Status-Tab."
          />
        )}
        {list.map((job) => {
          const apps = applications[job.id] ?? [];
          return (
            <article key={job.id} className="bausqo-panel bausqo-lift rounded-2xl p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-primary">{job.category}</span>
                  <h2 className="mt-3 text-lg font-black tracking-tight sm:text-xl">{job.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {[job.postal_code, job.city].filter(Boolean).join(" ")} · {jobStatusLabels[job.status]} · {apps.length} Bewerbung(en)
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" asChild><Link to="/auftrag/$id" params={{ id: job.id }}>Ansehen</Link></Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/auftrag/erstellen" search={{ draft: job.id }}><Pencil /> Bearbeiten</Link>
                  </Button>
                  {job.status === "published" ? (
                    <Button size="sm" variant="outline" onClick={async () => { await updateJob(job.id, { status: "paused" }); toast.success("Auftrag pausiert."); void load(); }}>
                      <Pause /> Pausieren
                    </Button>
                  ) : (
                    <Button size="sm" onClick={async () => { await updateJob(job.id, { status: "published", published_at: new Date().toISOString() }); toast.success("Auftrag veröffentlicht."); void load(); }}>
                      <Play /> Veröffentlichen
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      if (!confirm("Diesen Auftrag endgültig löschen?")) return;
                      await deleteJob(job.id);
                      toast.success("Auftrag gelöscht.");
                      void load();
                    }}
                  >
                    <Trash2 /> Löschen
                  </Button>
                </div>
              </div>

              {apps.length > 0 && (
                <div className="mt-4 space-y-2 border-t pt-4">
                  <h3 className="text-sm font-bold">Bewerbungen</h3>
                  {apps.map((a) => (
                    <div key={a.id} className="rounded-xl border bg-muted/25 p-4 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold">Status: {a.status}</span>
                        <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString("de-DE")}</span>
                      </div>
                      <p className="mt-1 whitespace-pre-line text-muted-foreground">{a.message}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {["Angesehen", "Angenommen", "Abgelehnt"].map((s) => (
                          <Button key={s} size="sm" variant="outline" onClick={async () => { await setApplicationStatus(a.id, s); toast.success(`Status: ${s}`); void load(); }}>
                            {s}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
