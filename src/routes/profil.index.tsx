import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Bookmark, MessageSquare, Pencil, UserRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/profil/")({
  head: () => ({
    meta: [
      { title: "Profil – BAUSQO" },
      { name: "description", content: "BAUSQO Profil mit Kontodaten, Standort und Fachgebiet verwalten." },
      { property: "og:title", content: "Profil – BAUSQO" },
      { property: "og:description", content: "Das eigene BAUSQO Profil verwalten." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

const accountLabels: Record<string, string> = {
  worker: "Fachkraft / Selbstständig",
  team: "Team / Kolonne",
  company: "Bauunternehmen",
};

type ProfileCounts = {
  applications: number;
  saved: number;
  conversations: number;
};

function ProfilePage() {
  const { user, profile, ready } = useAuth();
  const [counts, setCounts] = useState<ProfileCounts>({ applications: 0, saved: 0, conversations: 0 });

  useEffect(() => {
    if (!user) {
      setCounts({ applications: 0, saved: 0, conversations: 0 });
      return;
    }

    let active = true;

    async function loadCounts() {
      const [applications, saved, conversations] = await Promise.all([
        supabase.from("applications").select("*", { count: "exact", head: true }).eq("applicant_id", user.id),
        supabase.from("saved_jobs").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("conversations").select("*", { count: "exact", head: true }),
      ]);

      if (!active) return;
      setCounts({
        applications: applications.count ?? 0,
        saved: saved.count ?? 0,
        conversations: conversations.count ?? 0,
      });
    }

    void loadCounts();
    return () => {
      active = false;
    };
  }, [user]);

  const completeness = useMemo(() => {
    if (!profile) return 0;
    const base = [
      profile.display_name,
      profile.account_type,
      profile.city,
      profile.postal_code,
      profile.phone,
      profile.trade,
      profile.bio,
    ];
    if (profile.account_type === "company") base.push(profile.company_name);
    const filled = base.filter((value) => String(value ?? "").trim().length > 0).length;
    return Math.round((filled / base.length) * 100);
  }, [profile]);

  if (!ready) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-64 animate-pulse rounded-3xl bg-muted" />
        </div>
      </AppShell>
    );
  }

  if (!user || !profile) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="bausqo-panel rounded-3xl p-8 text-center">
            <UserRound className="mx-auto size-10 text-muted-foreground" />
            <h1 className="mt-4 text-2xl font-black">Profil ist an dein Konto gebunden</h1>
            <p className="mt-2 text-sm text-muted-foreground">Melde dich an, um deine echten Profildaten zu sehen und zu bearbeiten.</p>
            <Button asChild className="mt-5 rounded-xl">
              <Link to="/auth" search={{ mode: "signin", redirect: "/profil" }}>Anmelden</Link>
            </Button>
          </section>
        </div>
      </AppShell>
    );
  }

  const name = profile.company_name?.trim() || profile.display_name?.trim() || user.email || "BAUSQO Nutzer";
  const rows = [
    ["Kontotyp", accountLabels[profile.account_type] ?? profile.account_type],
    ["Anzeigename", profile.display_name || "—"],
    ["Unternehmen", profile.company_name || "—"],
    ["Fachgebiet", profile.trade || "—"],
    ["Standort", [profile.postal_code, profile.city].filter(Boolean).join(" ") || "—"],
    ["Telefon", profile.phone || "—"],
    ["E-Mail", user.email || "—"],
  ];

  return (
    <AppShell>
      <div className="bausqo-page mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Echtes Konto</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">{name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {accountLabels[profile.account_type] ?? profile.account_type} · Daten werden mit deinem BAUSQO Konto synchronisiert.
            </p>
          </div>
          <Button asChild className="rounded-xl">
            <Link to="/profil/bearbeiten"><Pencil className="size-4" /> Profil bearbeiten</Link>
          </Button>
        </div>

        <section className="bausqo-panel mt-7 rounded-3xl p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">Profil-Vollständigkeit</p>
              <h2 className="mt-1 text-xl font-black">{completeness} % abgeschlossen</h2>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">{completeness}%</span>
          </div>
          <Progress value={completeness} className="mt-4" />
        </section>

        <section className="bausqo-panel mt-6 rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <BriefcaseBusiness className="size-5" />
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">Kontodaten</p>
              <h2 className="text-lg font-black">Profilinformationen</h2>
            </div>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {rows.map(([label, value]) => (
              <div key={label} className="rounded-2xl border bg-muted/20 p-4">
                <dt className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
                <dd className="mt-1 break-words text-sm font-bold">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 rounded-2xl border bg-muted/20 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">Beschreibung</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6">{profile.bio || "Noch keine Beschreibung hinterlegt."}</p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <Link to="/bewerbungen" className="bausqo-panel bausqo-lift rounded-2xl p-5">
            <BriefcaseBusiness className="size-5 text-primary" />
            <p className="mt-4 text-2xl font-black">{counts.applications}</p>
            <p className="text-sm text-muted-foreground">Bewerbungen</p>
          </Link>
          <Link to="/gespeichert" className="bausqo-panel bausqo-lift rounded-2xl p-5">
            <Bookmark className="size-5 text-primary" />
            <p className="mt-4 text-2xl font-black">{counts.saved}</p>
            <p className="text-sm text-muted-foreground">Gespeichert</p>
          </Link>
          <Link to="/nachrichten" className="bausqo-panel bausqo-lift rounded-2xl p-5">
            <MessageSquare className="size-5 text-primary" />
            <p className="mt-4 text-2xl font-black">{counts.conversations}</p>
            <p className="text-sm text-muted-foreground">Unterhaltungen</p>
          </Link>
        </section>

        <section className="bausqo-panel mt-6 rounded-3xl p-6">
          <h2 className="text-lg font-black">Verifizierung</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Aktuell ist für dieses Profil kein verifizierter Nachweis hinterlegt. Ein Verifiziert-Badge wird erst nach einer echten Prüfung angezeigt.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
