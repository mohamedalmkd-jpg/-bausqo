import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, Loader2, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jobBudgetLabel, jobLocationLabel, listPublishedJobs, type JobRow } from "@/lib/jobs";
import { MarketMap } from "@/components/market-map";
import type { MarketItem } from "@/lib/demo-data";

/** Echte, von BauMatch-Mitgliedern veröffentlichte Aufträge aus der Datenbank. */
export function RealJobsSection({ query, category, location, map = false }: { query: string; category: string; location: string; map?: boolean }) {
  const [jobs, setJobs] = useState<JobRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    listPublishedJobs()
      .then((rows) => { if (active) setJobs(rows); })
      .catch((e: Error) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, []);

  if (error) {
    return (
      <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
        Echte Aufträge konnten nicht geladen werden: {error}
      </div>
    );
  }

  if (!jobs) {
    return <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Aufträge werden geladen …</div>;
  }

  const needle = `${query} ${location}`.toLowerCase().trim();
  const filtered = jobs.filter((j) => {
    const haystack = `${j.title} ${j.description} ${j.category} ${j.city ?? ""} ${j.postal_code ?? ""}`.toLowerCase();
    const matchesText = !needle || needle.split(/\s+/).every((t) => haystack.includes(t));
    const matchesCategory = category.startsWith("Alle") || j.category.toLowerCase().includes(category.toLowerCase());
    return matchesText && matchesCategory;
  });

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-extrabold">Aufträge von BauMatch-Mitgliedern ({filtered.length})</h2>
        <Button size="sm" asChild><Link to="/auftrag/erstellen" search={{ draft: undefined }}>Auftrag erstellen</Link></Button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Echte, veröffentlichte Aufträge – keine Demo-Daten.</p>

      {map && (() => {
        const geo = filtered.filter((j) => j.latitude != null && j.longitude != null);
        if (geo.length === 0) {
          return <p className="mt-4 rounded-lg border border-dashed p-5 text-sm text-muted-foreground">Für diese Suche liegen noch keine Standortdaten veröffentlichter Aufträge vor.</p>;
        }
        const items: MarketItem[] = geo.map((j, i) => ({
          id: i + 1,
          kind: "Aufträge",
          title: j.title,
          provider: "BauMatch Mitglied",
          location: j.city ?? "",
          postalCode: j.postal_code ?? "",
          state: j.state ?? "",
          distance: `${j.radius_km} km Umkreis`,
          category: j.category,
          start: j.start_date ?? "",
          duration: j.duration ?? "",
          budget: jobBudgetLabel(j),
          people: `${j.workers_needed} Person(en)`,
          description: j.description,
          match: 0,
          verified: false,
          lat: j.latitude as number,
          lng: j.longitude as number,
          locationPrecision: "approx",
          source: { type: "baumatch", label: "BauMatch Mitglied", permission: "eigene-daten" },
        }));
        const sel = selectedIndex != null ? geo[selectedIndex - 1] : null;
        return (
          <div className="mt-4 space-y-3">
            <MarketMap items={items} selectedId={selectedIndex} onSelect={setSelectedIndex} />
            {sel && (
              <div className="rounded-lg border bg-card p-4 text-sm">
                <p className="font-bold">{sel.title}</p>
                <p className="text-muted-foreground">{jobLocationLabel(sel)}</p>
                <Button className="mt-3" size="sm" asChild><Link to="/auftrag/$id" params={{ id: sel.id }}>Details ansehen</Link></Button>
              </div>
            )}
          </div>
        );
      })()}

      {filtered.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
          Für diese Suche gibt es noch keine veröffentlichten Aufträge von Mitgliedern. Unten finden Sie Demo-Einträge.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {filtered.map((job) => (
            <article key={job.id} className="bausqo-deferred-card rounded-lg border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{job.category}</span>
                <span className="rounded bg-muted px-2 py-1 text-xs font-semibold">{job.contract_type}</span>
              </div>
              <h3 className="mt-3 text-lg font-extrabold">{job.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
              <dl className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="size-4" />{jobLocationLabel(job)}</span>
                <span className="flex items-center gap-1"><CalendarDays className="size-4" />{job.start_date ? new Date(job.start_date).toLocaleDateString("de-DE") : "Start offen"}</span>
                <span className="flex items-center gap-1"><Users className="size-4" />{job.workers_needed} Person(en)</span>
                <span>{jobBudgetLabel(job)}</span>
              </dl>
              <Button className="mt-4" asChild><Link to="/auftrag/$id" params={{ id: job.id }}>Details ansehen</Link></Button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
