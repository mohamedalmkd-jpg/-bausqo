import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Save, UserRound } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useAuth, type AccountType } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/profil/bearbeiten")({
  head: () => ({
    meta: [
      { title: "Profil bearbeiten – BAUSQO" },
      { name: "description", content: "BAUSQO Profildaten direkt im eigenen Konto bearbeiten." },
      { property: "og:title", content: "Profil bearbeiten – BAUSQO" },
      { property: "og:description", content: "Kontodaten, Standort und Fachgebiet pflegen." },
    ],
  }),
  component: EditProfilePage,
});

const accountLabels: Record<AccountType, string> = {
  worker: "Fachkraft / Selbstständig",
  team: "Team / Kolonne",
  company: "Bauunternehmen",
};

type FormState = {
  display_name: string;
  company_name: string;
  account_type: AccountType;
  trade: string;
  postal_code: string;
  city: string;
  phone: string;
  bio: string;
  avatar_url: string;
};

const EMPTY: FormState = {
  display_name: "",
  company_name: "",
  account_type: "worker",
  trade: "",
  postal_code: "",
  city: "",
  phone: "",
  bio: "",
  avatar_url: "",
};

function EditProfilePage() {
  const { user, profile, ready, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setValues({
      display_name: profile.display_name ?? "",
      company_name: profile.company_name ?? "",
      account_type: (["worker", "team", "company"].includes(profile.account_type)
        ? profile.account_type
        : "worker") as AccountType,
      trade: profile.trade ?? "",
      postal_code: profile.postal_code ?? "",
      city: profile.city ?? "",
      phone: profile.phone ?? "",
      bio: profile.bio ?? "",
      avatar_url: profile.avatar_url ?? "",
    });
  }, [profile]);

  const completeness = useMemo(() => {
    const fields = [
      values.display_name,
      values.trade,
      values.postal_code,
      values.city,
      values.phone,
      values.bio,
      values.account_type,
    ];
    if (values.account_type === "company") fields.push(values.company_name);
    return Math.round((fields.filter((value) => value.trim().length > 0).length / fields.length) * 100);
  }, [values]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setFailure(null);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;

    if (values.display_name.trim().length < 2) {
      setFailure("Bitte einen Namen mit mindestens 2 Zeichen angeben.");
      return;
    }

    if (values.postal_code && !/^\d{5}$/.test(values.postal_code.trim())) {
      setFailure("Die PLZ muss aus 5 Ziffern bestehen.");
      return;
    }

    if (values.avatar_url && !/^https?:\/\/\S+$/i.test(values.avatar_url.trim())) {
      setFailure("Für das Profilbild bitte eine vollständige https:// URL angeben.");
      return;
    }

    setSaving(true);
    setFailure(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: values.display_name.trim(),
          company_name: values.account_type === "company" ? values.company_name.trim() : "",
          account_type: values.account_type,
          trade: values.trade.trim(),
          postal_code: values.postal_code.trim(),
          city: values.city.trim(),
          phone: values.phone.trim() || null,
          bio: values.bio.trim(),
          avatar_url: values.avatar_url.trim() || null,
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success("Profil im BAUSQO Konto gespeichert.");
      void navigate({ to: "/profil" });
    } catch (error) {
      setFailure("Profil konnte nicht gespeichert werden: " + (error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (!ready) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="h-72 animate-pulse rounded-3xl bg-muted" />
        </div>
      </AppShell>
    );
  }

  if (!user || !profile) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-4 py-10">
          <section className="bausqo-panel rounded-3xl p-8 text-center">
            <UserRound className="mx-auto size-10 text-muted-foreground" />
            <h1 className="mt-4 text-2xl font-black">Bitte anmelden</h1>
            <p className="mt-2 text-sm text-muted-foreground">Profiländerungen werden direkt mit deinem BAUSQO Konto gespeichert.</p>
            <Button asChild className="mt-5 rounded-xl">
              <Link to="/auth" search={{ mode: "signin", redirect: "/profil/bearbeiten" }}>Anmelden</Link>
            </Button>
          </section>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <form onSubmit={onSubmit} className="bausqo-page mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/profil" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Zurück zum Profil
        </Link>

        <h1 className="mt-5 text-3xl font-black tracking-[-0.04em]">Profil bearbeiten</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Änderungen werden direkt in deinem BAUSQO Konto gespeichert und sind nach der Anmeldung auf deinen Geräten verfügbar.
        </p>

        <section className="bausqo-panel mt-7 rounded-3xl p-6">
          <Label htmlFor="kind" className="text-sm font-bold">Kontotyp</Label>
          <select
            id="kind"
            value={values.account_type}
            onChange={(e) => update("account_type", e.target.value as AccountType)}
            className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm"
          >
            {(Object.keys(accountLabels) as AccountType[]).map((kind) => (
              <option key={kind} value={kind}>{accountLabels[kind]}</option>
            ))}
          </select>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-bold">Profil-Vollständigkeit</span>
              <span className="font-black">{completeness}%</span>
            </div>
            <Progress value={completeness} />
          </div>
        </section>

        <section className="bausqo-panel mt-6 rounded-3xl p-6">
          <h2 className="text-lg font-black">Basisdaten</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="display_name">Name *</Label>
              <Input id="display_name" value={values.display_name} onChange={(e) => update("display_name", e.target.value)} className="mt-2 h-11" />
            </div>

            {values.account_type === "company" && (
              <div>
                <Label htmlFor="company_name">Firmenname</Label>
                <Input id="company_name" value={values.company_name} onChange={(e) => update("company_name", e.target.value)} className="mt-2 h-11" />
              </div>
            )}

            <div>
              <Label htmlFor="trade">Fachgebiet / Gewerk</Label>
              <Input id="trade" value={values.trade} onChange={(e) => update("trade", e.target.value)} placeholder="z. B. Elektrotechnik" className="mt-2 h-11" />
            </div>

            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" value={values.phone} onChange={(e) => update("phone", e.target.value)} className="mt-2 h-11" />
            </div>

            <div>
              <Label htmlFor="postal_code">PLZ</Label>
              <Input id="postal_code" inputMode="numeric" value={values.postal_code} onChange={(e) => update("postal_code", e.target.value)} className="mt-2 h-11" />
            </div>

            <div>
              <Label htmlFor="city">Stadt</Label>
              <Input id="city" value={values.city} onChange={(e) => update("city", e.target.value)} className="mt-2 h-11" />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="avatar_url">Profilbild URL</Label>
              <Input id="avatar_url" value={values.avatar_url} onChange={(e) => update("avatar_url", e.target.value)} placeholder="https://…" className="mt-2 h-11" />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="bio">Beschreibung</Label>
              <Textarea id="bio" rows={5} value={values.bio} onChange={(e) => update("bio", e.target.value)} placeholder="Leistungen, Erfahrung und wichtige Informationen…" className="mt-2" />
            </div>
          </div>
        </section>

        {failure && (
          <p role="alert" className="mt-6 rounded-2xl border border-destructive/35 bg-destructive/5 p-4 text-sm font-semibold text-destructive">
            {failure}
          </p>
        )}

        <div className="sticky bottom-20 mt-7 flex flex-wrap gap-3 rounded-2xl border bg-card/95 p-4 shadow-lg backdrop-blur lg:bottom-4">
          <Button type="submit" className="rounded-xl" disabled={saving}>
            {saving ? <><Loader2 className="animate-spin" /> Speichern …</> : <><Save className="size-4" /> Änderungen speichern</>}
          </Button>
          <Button type="button" variant="outline" className="rounded-xl" disabled={saving} onClick={() => void navigate({ to: "/profil" })}>
            Abbrechen
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
