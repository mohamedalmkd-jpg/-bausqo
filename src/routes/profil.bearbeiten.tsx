import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useWorkspace } from "@/lib/workspace-state";
import {
  profileCompleteness,
  profileKindLabels,
  profileSchema,
  validateProfile,
  type ProfileKind,
  type ProfileValues,
} from "@/lib/profile-schema";

export const Route = createFileRoute("/profil/bearbeiten")({
  head: () => ({
    meta: [
      { title: "Profil bearbeiten – BauMatch" },
      { name: "description", content: "Profildaten nach Kontotyp bearbeiten: Fachkraft, Team oder Unternehmen." },
      { property: "og:title", content: "Profil bearbeiten – BauMatch" },
      { property: "og:description", content: "Profilangaben, Standort, Gewerke und Verfügbarkeit pflegen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EditProfilePage,
});

function EditProfilePage() {
  const { profile, hydrated, setProfileKind, saveProfile } = useWorkspace();
  const navigate = useNavigate();
  const [values, setValues] = useState<ProfileValues>(profile.values);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated) setValues(profile.values);
  }, [hydrated, profile.kind, profile.values]);

  const kind = profile.kind;
  const completeness = profileCompleteness(kind, values);

  function update(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateProfile(kind, values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFailure("Bitte die markierten Felder korrigieren.");
      return;
    }
    setFailure(null);
    setSaving(true);
    try {
      await saveProfile(values);
      toast.success("Profil gespeichert – die Angaben liegen in diesem Browser.");
      void navigate({ to: "/profil" });
    } catch (error) {
      setFailure("Speichern nicht möglich. Bitte prüfen, ob der Browser-Speicher verfügbar ist, und erneut versuchen.");
      console.error("profile save failed", error);
    } finally {
      setSaving(false);
    }
  }

  if (!hydrated) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
          <div className="h-8 w-52 animate-pulse rounded bg-muted" />
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <form onSubmit={onSubmit} className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/profil" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Zurück zum Profil</Link>
        <h1 className="mt-5 text-3xl font-extrabold">Profil bearbeiten</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Die Angaben werden in diesem Browser gespeichert. Ein Serverkonto ist noch nicht angebunden – es wird nichts an andere Nutzer übertragen.
        </p>

        <section className="mt-7 rounded-lg border bg-card p-6 shadow-sm">
          <Label htmlFor="kind" className="text-sm font-bold">Kontotyp</Label>
          <select
            id="kind"
            value={kind}
            onChange={(e) => setProfileKind(e.target.value as ProfileKind)}
            className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm"
          >
            {(Object.keys(profileKindLabels) as ProfileKind[]).map((k) => <option key={k} value={k}>{profileKindLabels[k]}</option>)}
          </select>
          <div className="mt-6">
            <Progress value={completeness} />
            <p className="mt-2 text-sm font-bold">{completeness} % ausgefüllt</p>
          </div>
        </section>

        {profileSchema[kind].map((section) => (
          <section key={section.title} className="mt-6 rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-extrabold">{section.title}</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {section.fields.map((field) => {
                const id = `f-${field.key}`;
                const error = errors[field.key];
                const value = values[field.key] ?? "";
                const wide = field.type === "textarea";
                return (
                  <div key={field.key} className={wide ? "sm:col-span-2" : ""}>
                    <Label htmlFor={id}>{field.label}{field.required && <span className="text-destructive"> *</span>}</Label>
                    {field.type === "textarea" ? (
                      <Textarea id={id} rows={4} value={value} onChange={(e) => update(field.key, e.target.value)} className="mt-2" aria-invalid={Boolean(error)} />
                    ) : field.type === "select" ? (
                      <select id={id} value={value} onChange={(e) => update(field.key, e.target.value)} className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm">
                        <option value="">Bitte wählen</option>
                        {(field.options ?? []).map((o) => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <Input
                        id={id}
                        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                        inputMode={field.type === "number" ? "numeric" : undefined}
                        value={value}
                        placeholder={field.placeholder}
                        onChange={(e) => update(field.key, e.target.value)}
                        className="mt-2 h-11"
                        aria-invalid={Boolean(error)}
                      />
                    )}
                    {field.help && !error && <p className="mt-1 text-xs text-muted-foreground">{field.help}</p>}
                    {error && <p role="alert" className="mt-1 text-xs font-semibold text-destructive">{error}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {failure && <p role="alert" className="mt-6 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm font-semibold text-destructive">{failure}</p>}

        <div className="sticky bottom-20 mt-7 flex flex-wrap gap-3 rounded-lg border bg-card p-4 shadow-lg lg:bottom-4">
          <Button type="submit" disabled={saving}>{saving ? <><Loader2 className="animate-spin" /> Speichern …</> : <><Save /> Änderungen speichern</>}</Button>
          <Button type="button" variant="outline" disabled={saving} onClick={() => { setValues(profile.values); setErrors({}); setFailure(null); void navigate({ to: "/profil" }); }}>Abbrechen</Button>
        </div>
      </form>
    </AppShell>
  );
}
