import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useWorkspace } from "@/lib/workspace-state";
import { profileCompleteness, profileKindLabels, profileSchema } from "@/lib/profile-schema";

export const Route = createFileRoute("/profil/")({
  head: () => ({
    meta: [
      { title: "Profil – BauMatch" },
      { name: "description", content: "Profil mit Gewerken, Standort, Kapazität und Verifizierungsstatus verwalten." },
      { property: "og:title", content: "Profil – BauMatch" },
      { property: "og:description", content: "Das eigene BauMatch Profil verwalten." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { applications, saved, contacts, profile, hydrated } = useWorkspace();
  const completeness = profileCompleteness(profile.kind, profile.values);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Profil</h1>
            <p className="mt-2 text-sm text-muted-foreground">Kontotyp: {profileKindLabels[profile.kind]} · Demo-Konto, Angaben liegen in diesem Browser.</p>
          </div>
          <Button asChild><Link to="/profil/bearbeiten"><Pencil /> Profil bearbeiten</Link></Button>
        </div>

        <section className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-extrabold">Profil-Vollständigkeit</h2>
          <Progress value={hydrated ? completeness : 0} className="mt-4" />
          <p className="mt-3 text-sm font-bold">{hydrated ? completeness : 0} % abgeschlossen</p>
        </section>

        {profileSchema[profile.kind].map((section) => (
          <section key={section.title} className="mt-6 rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-extrabold">{section.title}</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {section.fields.map((field) => (
                <div key={field.key} className="border-b pb-3">
                  <dt className="text-xs font-semibold uppercase text-muted-foreground">{field.label}</dt>
                  <dd className="mt-1 text-sm font-bold">{(profile.values[field.key] ?? "").trim() || "—"}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

        <section className="mt-6 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-extrabold">Verifizierung</h2>
          <p className="mt-3 text-sm text-muted-foreground">Status: <span className="font-bold text-foreground">Nicht verifiziert</span> – Nachweise werden erst nach echter Prüfung bestätigt.</p>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <Link to="/bewerbungen" className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"><p className="text-2xl font-extrabold">{applications.length}</p><p className="text-sm text-muted-foreground">Bewerbungen</p></Link>
          <Link to="/gespeichert" className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"><p className="text-2xl font-extrabold">{saved.length}</p><p className="text-sm text-muted-foreground">Gespeichert</p></Link>
          <Link to="/nachrichten" className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"><p className="text-2xl font-extrabold">{contacts.length}</p><p className="text-sm text-muted-foreground">Anfragen</p></Link>
        </section>
      </div>
    </AppShell>
  );
}
