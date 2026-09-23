import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, MapPin } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { MatchBadge, SaveButton } from "@/components/market-card";
import { ShareButton } from "@/components/share-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { detailHeadline, mapLabel, matchReasons } from "@/lib/market-utils";
import { isExternal, sourceNotice } from "@/lib/data-sources";
import { useWorkspace } from "@/lib/workspace-state";
import type { MarketItem } from "@/lib/demo-data";

export function detailMeta(item: MarketItem | undefined) {
  if (!item) return { meta: [{ title: "Eintrag nicht gefunden – BauMatch" }, { name: "robots", content: "noindex" }] };
  const description = `${item.category} · ${item.location} · ${item.duration}. ${item.description}`;
  return {
    meta: [
      { title: `${item.title} – BauMatch` },
      { name: "description", content: description },
      { property: "og:title", content: `${item.title} – BauMatch` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}

export function DetailNotFound() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold">Eintrag nicht gefunden</h1>
        <p className="mt-2 text-sm text-muted-foreground">Dieser Demo-Eintrag existiert nicht (mehr).</p>
        <Button asChild className="mt-6"><Link to="/marketplace">Zurück zum Marketplace</Link></Button>
      </div>
    </AppShell>
  );
}

function ApplyDialog({ item }: { item: MarketItem }) {
  const { addApplication, hasApplied, hydrated } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [error, setError] = useState<string | null>(null);
  const applied = hydrated && hasApplied(item.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 flex-1" disabled={applied}>{applied ? "Bewerbung erfasst" : "Jetzt bewerben"}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bewerbung auf „{item.title}“</DialogTitle>
          <DialogDescription>Die Bewerbung wird nur lokal in diesem Browser gespeichert und noch an niemanden verschickt.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (message.trim().length < 20) { setError("Bitte mindestens 20 Zeichen zu Erfahrung und Kapazität angeben."); return; }
            if (!availableFrom) { setError("Bitte ein Startdatum angeben."); return; }
            setError(null);
            addApplication({ itemId: item.id, title: item.title, provider: item.provider, message: message.trim(), availableFrom });
            setOpen(false);
            toast.success("Bewerbung lokal gespeichert – Status „Neu“.");
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="apply-msg">Kurzvorstellung</Label>
            <Textarea id="apply-msg" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Erfahrung, Qualifikationen, verfügbare Personen" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apply-date">Verfügbar ab</Label>
            <Input id="apply-date" type="date" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} />
          </div>
          {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit">Bewerbung speichern</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ContactDialog({ item }: { item: MarketItem }) {
  const { addContact } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(`Anfrage: ${item.title}`);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" className="h-11 flex-1">Anfrage senden</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Anfrage an {item.provider}</DialogTitle>
          <DialogDescription>Nachrichten werden lokal gespeichert. Ein Versand ist erst mit angebundenem Postfach möglich.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!subject.trim()) { setError("Bitte einen Betreff angeben."); return; }
            if (message.trim().length < 10) { setError("Bitte mindestens 10 Zeichen schreiben."); return; }
            setError(null);
            addContact({ itemId: item.id, title: item.title, provider: item.provider, subject: subject.trim(), message: message.trim() });
            setOpen(false);
            toast.success("Anfrage lokal gespeichert – unter „Nachrichten“ zu finden.");
          }}
        >
          <div className="space-y-2"><Label htmlFor="c-subject">Betreff</Label><Input id="c-subject" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="c-msg">Nachricht</Label><Textarea id="c-msg" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ihre Frage oder Ihr Angebot" /></div>
          {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}
          <DialogFooter><Button type="submit">Anfrage speichern</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MarketDetail({ item }: { item: MarketItem }) {
  const external = isExternal(item.source);
  const facts: [string, string][] = [
    ["Standort", mapLabel(item)],
    ["PLZ / Bundesland", `${item.locationPrecision === "approx" ? "—" : item.postalCode} · ${item.state}`],
    ["Entfernung", item.distance],
    ["Gewerk", item.category],
    ["Start", item.start],
    ["Dauer", item.duration],
    ["Kapazität / Bedarf", item.people],
    ["Budget", item.budget],
    ["Verifizierung", item.verified ? "Verifiziert" : "Nicht verifiziert"],
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Zurück zum Marketplace</Link>

        <header className="mt-6 rounded-lg border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{detailHeadline(item.kind)}</span>
                <span className="rounded bg-brand-orange/10 px-2 py-1 text-xs font-bold text-brand-orange">Demo-Eintrag</span>
                {external && <span className="rounded bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">Externe Quelle</span>}
              </div>
              <h1 className="mt-4 text-3xl font-extrabold">{item.title}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="size-4" />{item.provider} · {mapLabel(item)}</p>
            </div>
            <MatchBadge score={item.match} />
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            {(item.kind === "Jobs" || item.kind === "Aufträge") && !external ? <ApplyDialog item={item} /> : null}
            {external ? null : <ContactDialog item={item} />}
            <SaveButton item={item} className="h-11" />
            <ShareButton item={item} className="h-11" />
          </div>
          {external && (
            <p className="mt-4 rounded-md border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
              Dieser Eintrag stammt aus einer externen Quelle und ist kein BauMatch-Mitglied. Bewerbung und Direktanfrage sind daher hier nicht möglich.
              {item.source.url && <> Quelle: <a className="underline" href={item.source.url} target="_blank" rel="noopener noreferrer">{item.source.label}</a>{item.source.importedAt && ` · importiert am ${item.source.importedAt}`}{item.source.expiresAt && ` · gültig bis ${item.source.expiresAt}`}</>}
            </p>
          )}
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-extrabold">Beschreibung</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
            <h3 className="mt-8 text-sm font-extrabold uppercase text-muted-foreground">Eckdaten</h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {facts.map(([k, v]) => (
                <div key={k} className="border-b pb-3">
                  <dt className="text-xs font-semibold uppercase text-muted-foreground">{k}</dt>
                  <dd className="mt-1 text-sm font-bold">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-xs text-muted-foreground">{sourceNotice(item.source)}</p>
          </section>

          <aside className="space-y-6">
            <section className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-extrabold">{item.match} % Übereinstimmung</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {matchReasons(item).map((r) => <li key={r} className="flex items-center gap-2"><Check className="size-4 text-primary" />{r}</li>)}
              </ul>
              <p className="mt-5 text-xs leading-5 text-muted-foreground">Der Wert beschreibt fachliche und organisatorische Übereinstimmung – keine Aussage über Verifizierung oder Vertrauenswürdigkeit.</p>
            </section>
            <section className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-extrabold">Verifizierung</h2>
              <p className="mt-3 text-sm text-muted-foreground">Status: <span className="font-bold text-foreground">Nicht verifiziert</span></p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">Nachweise wie Gewerbeanmeldung oder Handelsregister werden erst nach echter Prüfung bestätigt.</p>
            </section>
            <section className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-extrabold">Bewertungen</h2>
              <p className="mt-3 text-sm text-muted-foreground">Noch keine Bewertungen. Bewertungen entstehen erst nach abgeschlossenen Aufträgen.</p>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
