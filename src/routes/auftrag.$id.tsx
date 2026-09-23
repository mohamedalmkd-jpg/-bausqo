import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Bookmark, CalendarDays, Euro, Loader2, MapPin, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PublicHeader } from "@/components/public-header";
import { ShareLinkButton } from "@/components/share-sheet";
import { useAuth } from "@/lib/auth";
import {
  applyToJob,
  getJob,
  isJobSaved,
  jobBudgetLabel,
  jobLocationLabel,
  jobStatusLabels,
  myApplication,
  startConversation,
  toggleSavedJob,
  type ApplicationRow,
  type JobRow,
} from "@/lib/jobs";

export const Route = createFileRoute("/auftrag/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Auftrag · BauMatch" },
      { name: "description", content: "Bauauftrag auf BauMatch: Leistungsumfang, Ort, Startdatum, Dauer und Anforderungen – direkt bewerben oder Kontakt aufnehmen." },
      { property: "og:title", content: "Auftrag · BauMatch" },
      { property: "og:description", content: "Bauauftrag auf BauMatch ansehen und bewerben." },
    ],
  }),
  component: JobDetailPage,
});

function JobDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, ready } = useAuth();
  const [job, setJob] = useState<JobRow | null | "missing">(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [application, setApplication] = useState<ApplicationRow | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const row = await getJob(id);
      setJob(row ?? "missing");
      if (row && user) {
        setSaved(await isJobSaved(user.id, row.id));
        setApplication(await myApplication(row.id, user.id));
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }, [id, user]);

  useEffect(() => { void load(); }, [load]);

  if (error) {
    return (
      <Page>
        <h1 className="text-xl font-bold">Auftrag konnte nicht geladen werden</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button className="mt-4" onClick={() => void load()}>Erneut versuchen</Button>
      </Page>
    );
  }

  if (job === null) {
    return <Page><div className="grid h-64 place-items-center text-muted-foreground"><Loader2 className="animate-spin" /></div></Page>;
  }

  if (job === "missing") {
    return (
      <Page>
        <h1 className="text-xl font-bold">Auftrag nicht gefunden</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dieser Auftrag existiert nicht mehr oder ist nicht öffentlich sichtbar.
        </p>
        <Button className="mt-4" asChild><Link to="/marketplace">Zum Marktplatz</Link></Button>
      </Page>
    );
  }

  const isOwner = user?.id === job.creator_id;
  const shareText = `${job.title}\n${job.category} · ${jobLocationLabel(job)}\nJetzt auf BauMatch ansehen`;

  function requireLogin() {
    void navigate({ to: "/auth", search: { redirect: `/auftrag/${id}`, mode: "signin" } });
  }

  return (
    <Page>
      <nav className="mb-4 text-sm text-muted-foreground"><Link to="/marketplace" className="hover:underline">Marktplatz</Link> / Auftrag</nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <article className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{job.category}</span>
            <span className="rounded bg-muted px-2 py-1 text-xs font-semibold">{job.contract_type}</span>
            <span className="rounded bg-muted px-2 py-1 text-xs font-semibold">{jobStatusLabels[job.status]}</span>
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">{job.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Eingestellt am {new Date(job.created_at).toLocaleDateString("de-DE")}
            {job.published_at ? ` · veröffentlicht am ${new Date(job.published_at).toLocaleDateString("de-DE")}` : ""}
          </p>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <Meta icon={MapPin} label="Ort" value={`${jobLocationLabel(job)}${job.state ? `, ${job.state}` : ""} · Umkreis ${job.radius_km} km`} />
            <Meta icon={CalendarDays} label="Start" value={job.start_date ? new Date(job.start_date).toLocaleDateString("de-DE") : "nach Absprache"} />
            <Meta icon={CalendarDays} label="Dauer" value={job.duration || "offen"} />
            <Meta icon={Users} label="Benötigte Personen" value={String(job.workers_needed)} />
            <Meta icon={Euro} label="Budget" value={jobBudgetLabel(job)} />
            {job.end_date && <Meta icon={CalendarDays} label="Ende" value={new Date(job.end_date).toLocaleDateString("de-DE")} />}
            {job.compensation && <Meta icon={Euro} label="Vergütung" value={job.compensation} />}
            {job.experience_level && <Meta icon={Users} label="Erfahrung" value={job.experience_level} />}
            {job.availability && <Meta icon={CalendarDays} label="Verfügbarkeit" value={job.availability} />}
          </dl>

          <h2 className="mt-8 text-lg font-bold">Beschreibung</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-7">{job.description}</p>

          {job.requirements && (
            <>
              <h2 className="mt-6 text-lg font-bold">Anforderungen</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-7">{job.requirements}</p>
            </>
          )}

          {job.qualifications && (
            <>
              <h2 className="mt-6 text-lg font-bold">Qualifikationen</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-7">{job.qualifications}</p>
            </>
          )}

          {(job.contact_name || job.contact_email || job.contact_phone) && (
            <>
              <h2 className="mt-6 text-lg font-bold">Kontakt</h2>
              <p className="mt-2 text-sm leading-7">
                {[job.contact_name, job.contact_email, job.contact_phone].filter(Boolean).join(" · ")}
              </p>
            </>
          )}

          {job.media_paths?.length > 0 && (
            <p className="mt-6 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
              {job.media_paths.length} Datei(en) hinterlegt. Dateien liegen in einem geschützten Speicher und werden nur
              nach Anmeldung bereitgestellt.
            </p>
          )}

          <p className="mt-6 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
            Angaben stammen vom Auftraggeber. Eine Prüfung durch BauMatch hat nicht stattgefunden.
          </p>
        </article>

        <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            {isOwner ? (
              <>
                <p className="mb-3 text-sm text-muted-foreground">Dies ist Ihr Auftrag.</p>
                <Button className="w-full" asChild><Link to="/auftrag/erstellen" search={{ draft: job.id }}>Bearbeiten</Link></Button>
                <Button variant="outline" className="mt-2 w-full" asChild><Link to="/meine-auftraege">Bewerbungen ansehen</Link></Button>
              </>
            ) : (
              <>
                {application ? (
                  <p className="mb-3 rounded-md border bg-muted/40 p-3 text-sm">
                    Sie haben sich beworben. Status: <strong>{application.status}</strong>
                  </p>
                ) : (
                  <ApplyDialog
                    disabled={!ready}
                    onRequireLogin={user ? null : requireLogin}
                    onSubmit={async (message, availableFrom) => {
                      if (!user) return;
                      const row = await applyToJob(job.id, user.id, message, availableFrom);
                      setApplication(row);
                      toast.success("Bewerbung gesendet.");
                    }}
                  />
                )}
                <ContactDialog
                  onRequireLogin={user ? null : requireLogin}
                  onSubmit={async (body) => {
                    if (!user) return;
                    await startConversation({
                      jobId: job.id,
                      subject: job.title,
                      senderId: user.id,
                      recipientId: job.creator_id,
                      body,
                    });
                    toast.success("Nachricht gesendet.");
                    void navigate({ to: "/nachrichten" });
                  }}
                />
              </>
            )}

            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={async () => {
                if (!user) return requireLogin();
                const next = await toggleSavedJob(user.id, job.id);
                setSaved(next);
                toast.success(next ? "Auftrag gespeichert." : "Aus den gespeicherten Aufträgen entfernt.");
              }}
            >
              <Bookmark className={saved ? "fill-current" : ""} /> {saved ? "Gespeichert" : "Auftrag speichern"}
            </Button>

            <ShareLinkButton
              variant="secondary"
              className="mt-2 w-full"
              title={`BauMatch: ${job.title}`}
              text={shareText}
              path={`/auftrag/${job.id}`}
            />
          </div>
        </aside>
      </div>
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40">
      <PublicHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <Icon className="mt-0.5 size-4 text-primary" />
      <div>
        <dt className="text-xs uppercase text-muted-foreground">{label}</dt>
        <dd className="text-sm font-semibold">{value}</dd>
      </div>
    </div>
  );
}

function ApplyDialog({
  onSubmit,
  onRequireLogin,
  disabled,
}: {
  onSubmit: (message: string, availableFrom: string | null) => Promise<void>;
  onRequireLogin: (() => void) | null;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [from, setFrom] = useState("");
  const [busy, setBusy] = useState(false);

  if (onRequireLogin) {
    return (
      <Button className="w-full" disabled={disabled} onClick={onRequireLogin}>
        Jetzt bewerben
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="w-full">Jetzt bewerben</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bewerbung senden</DialogTitle>
          <DialogDescription>Ihre Nachricht geht direkt an den Auftraggeber.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="apply-msg">Nachricht</Label>
            <Textarea id="apply-msg" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apply-from">Verfügbar ab</Label>
            <Input id="apply-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <Button
            className="w-full"
            disabled={busy}
            onClick={async () => {
              if (message.trim().length < 20) {
                toast.error("Bitte mindestens 20 Zeichen schreiben.");
                return;
              }
              setBusy(true);
              try {
                await onSubmit(message.trim(), from || null);
                setOpen(false);
              } catch (e) {
                toast.error(`Bewerbung fehlgeschlagen: ${(e as Error).message}`);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy && <Loader2 className="animate-spin" />} Bewerbung absenden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ContactDialog({
  onSubmit,
  onRequireLogin,
}: {
  onSubmit: (body: string) => Promise<void>;
  onRequireLogin: (() => void) | null;
}) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  if (onRequireLogin) {
    return <Button variant="outline" className="mt-2 w-full" onClick={onRequireLogin}><Send /> Kontakt aufnehmen</Button>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" className="mt-2 w-full"><Send /> Kontakt aufnehmen</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nachricht an den Auftraggeber</DialogTitle>
          <DialogDescription>Die Unterhaltung wird mit diesem Auftrag verknüpft.</DialogDescription>
        </DialogHeader>
        <Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
        <Button
          disabled={busy}
          onClick={async () => {
            if (body.trim().length < 10) {
              toast.error("Bitte mindestens 10 Zeichen schreiben.");
              return;
            }
            setBusy(true);
            try {
              await onSubmit(body.trim());
              setOpen(false);
            } catch (e) {
              toast.error(`Senden fehlgeschlagen: ${(e as Error).message}`);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy && <Loader2 className="animate-spin" />} Nachricht senden
        </Button>
      </DialogContent>
    </Dialog>
  );
}
