import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, Upload } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  availabilityOptions,
  contractTypes,
  createJob,
  emptyDraft,
  experienceLevels,
  germanStates,
  getJob,
  jobCategories,
  notifyJobPublished,
  updateJob,
  validateDraft,
  type JobDraft,
} from "@/lib/jobs";

export const Route = createFileRoute("/auftrag/erstellen")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    draft: typeof search["draft"] === "string" ? (search["draft"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Auftrag erstellen · BauMatch" },
      { name: "description", content: "Erstellen Sie in wenigen Schritten einen Bauauftrag und erreichen Sie passende Fachkräfte, Teams und Subunternehmer." },
      { property: "og:title", content: "Auftrag erstellen · BauMatch" },
      { property: "og:description", content: "Bauauftrag veröffentlichen und passende Fachkräfte finden." },
    ],
  }),
  component: CreateJobPage,
});

const steps = [
  "Titel",
  "Gewerk",
  "Beschreibung",
  "Ort",
  "Startdatum",
  "Dauer",
  "Personen",
  "Budget",
  "Auftragsart",
  "Anforderungen",
  "Dateien",
  "Vorschau",
];

function CreateJobPage() {
  const navigate = useNavigate();
  const { user, ready } = useAuth();
  const { draft: draftId } = Route.useSearch();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<JobDraft>(emptyDraft());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<"save" | "publish" | "upload" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(draftId ?? null);

  useEffect(() => {
    if (ready && !user) {
      void navigate({ to: "/auth", search: { redirect: "/auftrag/erstellen", mode: "signin" }, replace: true });
    }
  }, [ready, user, navigate]);

  useEffect(() => {
    if (!draftId) return;
    void getJob(draftId).then((job) => {
      if (!job) return;
      setEditingId(job.id);
      setDraft({
        title: job.title,
        description: job.description,
        category: job.category,
        contract_type: job.contract_type,
        postal_code: job.postal_code,
        city: job.city,
        state: job.state,
        latitude: job.latitude,
        longitude: job.longitude,
        radius_km: job.radius_km,
        start_date: job.start_date,
        duration: job.duration,
        workers_needed: job.workers_needed,
        budget_min: job.budget_min,
        budget_max: job.budget_max,
        requirements: job.requirements,
        end_date: job.end_date,
        qualifications: job.qualifications,
        experience_level: job.experience_level,
        compensation: job.compensation,
        availability: job.availability,
        contact_name: job.contact_name,
        contact_email: job.contact_email,
        contact_phone: job.contact_phone,
        media_paths: job.media_paths ?? [],
      });
    });
  }, [draftId]);

  function set<K extends keyof JobDraft>(key: K, value: JobDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function persist(status: "draft" | "published") {
    if (!user) return;
    const found = validateDraft(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error("Bitte prüfen Sie die markierten Pflichtangaben.");
      setStep(11);
      return;
    }
    setBusy(status === "draft" ? "save" : "publish");
    try {
      if (editingId) {
        const updated = await updateJob(editingId, {
          ...draft,
          status,
          ...(status === "published" ? { published_at: new Date().toISOString() } : {}),
        });
        toast.success(status === "published" ? "Auftrag erfolgreich veröffentlicht." : "Entwurf gespeichert.");
        if (status === "published") {
          await notifyJobPublished(user.id, updated);
          void navigate({ to: "/auftrag/$id", params: { id: updated.id } });
        } else void navigate({ to: "/meine-auftraege" });
      } else {
        const created = await createJob(user.id, draft, status);
        setEditingId(created.id);
        toast.success(status === "published" ? "Auftrag erfolgreich veröffentlicht." : "Entwurf gespeichert.");
        if (status === "published") {
          await notifyJobPublished(user.id, created);
          void navigate({ to: "/auftrag/$id", params: { id: created.id } });
        } else void navigate({ to: "/meine-auftraege" });
      }
    } catch (error) {
      toast.error(`Speichern fehlgeschlagen: ${(error as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  async function upload(files: FileList | null) {
    if (!files?.length || !user) return;
    setBusy("upload");
    try {
      const paths: string[] = [];
      for (const file of Array.from(files)) {
        const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
        const { error } = await supabase.storage.from("job-media").upload(path, file);
        if (error) throw new Error(error.message);
        paths.push(path);
      }
      set("media_paths", [...draft.media_paths, ...paths]);
      toast.success(`${paths.length} Datei(en) hochgeladen.`);
    } catch (error) {
      toast.error(`Upload fehlgeschlagen: ${(error as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  if (!ready || !user) {
    return (
      <AppShell>
        <div className="grid h-64 place-items-center text-muted-foreground"><Loader2 className="animate-spin" /></div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {editingId ? "Auftrag bearbeiten" : "Auftrag erstellen"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Schritt {step + 1} von {steps.length} · {steps[step]}
        </p>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>

        <div className="mt-6 space-y-4 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
          {step === 0 && (
            <Field label="Auftragstitel" error={errors["title"]}>
              <Input
                id="f-title"
                value={draft.title}
                placeholder="Elektriker für Gewerbehalle gesucht"
                onChange={(e) => set("title", e.target.value)}
              />
            </Field>
          )}

          {step === 1 && (
            <Field label="Kategorie / Fachgebiet" error={errors["category"]}>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {jobCategories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set("category", c)}
                    className={`h-11 rounded-lg border text-sm font-semibold transition-colors ${draft.category === c ? "border-primary bg-primary/5 text-primary" : "hover:border-primary/40"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Field>
          )}

          {step === 2 && (
            <Field label="Beschreibung" error={errors["description"]}>
              <Textarea
                id="f-description"
                rows={7}
                value={draft.description}
                placeholder="Leistungsumfang, Objekt, Rahmenbedingungen …"
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
          )}

          {step === 3 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="PLZ" error={errors["postal_code"]}>
                <Input id="f-plz" value={draft.postal_code ?? ""} onChange={(e) => set("postal_code", e.target.value)} />
              </Field>
              <Field label="Stadt" error={errors["city"]}>
                <Input id="f-city" value={draft.city ?? ""} onChange={(e) => set("city", e.target.value)} />
              </Field>
              <Field label="Bundesland">
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={draft.state ?? ""}
                  onChange={(e) => set("state", e.target.value)}
                >
                  <option value="">Bitte wählen</option>
                  {germanStates.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label={`Radius: ${draft.radius_km} km`}>
                <input
                  type="range"
                  min={5}
                  max={300}
                  step={5}
                  className="w-full"
                  value={draft.radius_km}
                  onChange={(e) => set("radius_km", Number(e.target.value))}
                />
              </Field>
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Startdatum">
                <Input
                  id="f-start"
                  type="date"
                  value={draft.start_date ?? ""}
                  onChange={(e) => set("start_date", e.target.value || null)}
                />
              </Field>
              <Field label="Enddatum" error={errors["end_date"]}>
                <Input
                  id="f-end"
                  type="date"
                  value={draft.end_date ?? ""}
                  onChange={(e) => set("end_date", e.target.value || null)}
                />
              </Field>
            </div>
          )}

          {step === 5 && (
            <Field label="Projektdauer">
              <Input
                id="f-duration"
                value={draft.duration ?? ""}
                placeholder="z. B. 6 Wochen"
                onChange={(e) => set("duration", e.target.value)}
              />
            </Field>
          )}

          {step === 6 && (
            <Field label="Anzahl benötigter Personen" error={errors["workers_needed"]}>
              <Input
                id="f-people"
                type="number"
                min={1}
                value={draft.workers_needed}
                onChange={(e) => set("workers_needed", Number(e.target.value))}
              />
            </Field>
          )}

          {step === 7 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Budget von (€)">
                <Input
                  type="number"
                  min={0}
                  value={draft.budget_min ?? ""}
                  onChange={(e) => set("budget_min", e.target.value === "" ? null : Number(e.target.value))}
                />
              </Field>
              <Field label="Budget bis (€)" error={errors["budget_max"]}>
                <Input
                  type="number"
                  min={0}
                  value={draft.budget_max ?? ""}
                  onChange={(e) => set("budget_max", e.target.value === "" ? null : Number(e.target.value))}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Vergütung">
                  <Input
                    id="f-compensation"
                    value={draft.compensation ?? ""}
                    placeholder="z. B. 45 €/Std., Pauschale nach Aufmaß"
                    onChange={(e) => set("compensation", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 8 && (
            <Field label="Auftragsart">
              <div className="grid gap-2 sm:grid-cols-2">
                {contractTypes.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set("contract_type", c)}
                    className={`h-11 rounded-lg border text-sm font-semibold transition-colors ${draft.contract_type === c ? "border-primary bg-primary/5 text-primary" : "hover:border-primary/40"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Field>
          )}

          {step === 9 && (
            <div className="space-y-4">
              <Field label="Anforderungen">
                <Textarea
                  rows={5}
                  value={draft.requirements ?? ""}
                  placeholder="Leistungsumfang, Arbeitszeiten, Unterkunft …"
                  onChange={(e) => set("requirements", e.target.value)}
                />
              </Field>
              <Field label="Qualifikationen">
                <Textarea
                  id="f-qualifications"
                  rows={3}
                  value={draft.qualifications ?? ""}
                  placeholder="Ausbildung, Meister, Zertifikate, Führerschein …"
                  onChange={(e) => set("qualifications", e.target.value)}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Erfahrung">
                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={draft.experience_level ?? ""}
                    onChange={(e) => set("experience_level", e.target.value)}
                  >
                    <option value="">Keine Angabe</option>
                    {experienceLevels.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Verfügbarkeit">
                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={draft.availability ?? ""}
                    onChange={(e) => set("availability", e.target.value)}
                  >
                    <option value="">Keine Angabe</option>
                    {availabilityOptions.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Ansprechpartner" error={errors["contact_name"]}>
                  <Input id="f-contact-name" value={draft.contact_name ?? ""} onChange={(e) => set("contact_name", e.target.value)} />
                </Field>
                <Field label="Kontakt E-Mail" error={errors["contact_email"]}>
                  <Input id="f-contact-email" type="email" value={draft.contact_email ?? ""} onChange={(e) => set("contact_email", e.target.value)} />
                </Field>
                <Field label="Kontakt Telefon">
                  <Input id="f-contact-phone" value={draft.contact_phone ?? ""} onChange={(e) => set("contact_phone", e.target.value)} />
                </Field>
              </div>
            </div>
          )}

          {step === 10 && (
            <div className="space-y-3">
              <Label>Fotos / Dokumente (optional)</Label>
              <input type="file" multiple onChange={(e) => void upload(e.target.files)} className="block text-sm" />
              {busy === "upload" && <p className="text-sm text-muted-foreground"><Loader2 className="mr-2 inline size-4 animate-spin" />Wird hochgeladen …</p>}
              <ul className="space-y-1 text-sm text-muted-foreground">
                {draft.media_paths.map((p) => <li key={p} className="break-all">• {p.split("/").pop()}</li>)}
              </ul>
              <p className="text-xs text-muted-foreground">
                Dateien liegen in einem geschützten Speicher. Sie sind nur für angemeldete Nutzer sichtbar.
              </p>
            </div>
          )}

          {step === 11 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold">Auftrag prüfen</h2>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <Row label="Titel" value={draft.title} />
                <Row label="Gewerk" value={draft.category} />
                <Row label="Auftragsart" value={draft.contract_type} />
                <Row label="Ort" value={[draft.postal_code, draft.city, draft.state].filter(Boolean).join(" ")} />
                <Row label="Radius" value={`${draft.radius_km} km`} />
                <Row label="Start" value={draft.start_date ?? "offen"} />
                <Row label="Dauer" value={draft.duration || "offen"} />
                <Row label="Personen" value={String(draft.workers_needed)} />
                <Row label="Budget" value={[draft.budget_min, draft.budget_max].filter((v) => v != null).join(" – ") || "auf Anfrage"} />
                <Row label="Ende" value={draft.end_date ?? "offen"} />
                <Row label="Vergütung" value={draft.compensation || "auf Anfrage"} />
                <Row label="Erfahrung" value={draft.experience_level || "keine Angabe"} />
                <Row label="Verfügbarkeit" value={draft.availability || "keine Angabe"} />
                <Row label="Qualifikationen" value={draft.qualifications || "keine Angabe"} />
                <Row label="Kontakt" value={[draft.contact_name, draft.contact_email, draft.contact_phone].filter(Boolean).join(" · ")} />
              </dl>
              <p className="whitespace-pre-line rounded-md border bg-muted/40 p-3 text-sm">{draft.description}</p>
              {Object.keys(errors).length > 0 && (
                <ul className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {Object.values(errors).map((e) => <li key={e}>• {e}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
            <ArrowLeft /> Zurück
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}>Weiter <ArrowRight /></Button>
          ) : (
            <Button onClick={() => void persist("published")} disabled={busy !== null}>
              {busy === "publish" && <Loader2 className="animate-spin" />} Auftrag veröffentlichen
            </Button>
          )}
          <Button variant="secondary" className="ml-auto" onClick={() => void persist("draft")} disabled={busy !== null}>
            {busy === "save" ? <Loader2 className="animate-spin" /> : <Upload />} Als Entwurf speichern
          </Button>
          <Button variant="ghost" disabled={busy !== null} onClick={() => void navigate({ to: "/meine-auftraege" })}>
            Abbrechen
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, error, children }: { label: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-2">
      <dt className="text-xs uppercase text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value || "—"}</dd>
    </div>
  );
}
