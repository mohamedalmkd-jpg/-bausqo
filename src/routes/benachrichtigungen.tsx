import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/lib/workspace-state";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/benachrichtigungen")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Benachrichtigungen – BauMatch" },
      { name: "description", content: "Meldungen zu Bewerbungen, Nachrichten und Aufträgen in Ihrem BauMatch-Konto." },
      { property: "og:title", content: "Benachrichtigungen – BauMatch" },
      { property: "og:description", content: "Das Benachrichtigungscenter von BauMatch." },
    ],
  }),
  component: NotificationsPage,
});

type DbNotification = { id: string; kind: string; title: string; body: string | null; link: string | null; read: boolean; created_at: string };

function NotificationsPage() {
  const { notifications, markNotificationsRead, hydrated } = useWorkspace();
  const { user, ready } = useAuth();
  const [rows, setRows] = useState<DbNotification[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) { setRows([]); return; }
    const { data, error: loadError } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (loadError) { setError(loadError.message); return; }
    setRows((data ?? []) as DbNotification[]);
    const unread = (data ?? []).filter((n) => !(n as DbNotification).read).map((n) => (n as DbNotification).id);
    if (unread.length > 0) await supabase.from("notifications").update({ read: true }).in("id", unread);
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (hydrated && notifications.some((n) => !n.read)) markNotificationsRead();
  }, [hydrated, notifications, markNotificationsRead]);

  const empty = (rows?.length ?? 0) === 0 && (!hydrated || notifications.length === 0);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold">Benachrichtigungen</h1>
        {!user && ready && (
          <p className="mt-2 text-sm text-muted-foreground">
            Ohne Anmeldung sehen Sie nur lokale Meldungen aus dieser Sitzung.{" "}
            <Link to="/auth" search={{ redirect: "/benachrichtigungen", mode: "signin" }} className="font-semibold text-primary">Anmelden</Link>
          </p>
        )}
        {error && (
          <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
            Konnte nicht geladen werden: {error} <Button size="sm" variant="outline" className="ml-2" onClick={() => void load()}>Erneut versuchen</Button>
          </div>
        )}

        {user && !rows && !error ? (
          <div className="mt-10 grid place-items-center"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="mt-8 space-y-3">
            {(rows ?? []).map((n) => (
              <article key={n.id} className="flex gap-4 rounded-lg border bg-card p-4 shadow-sm">
                <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><Bell className="size-4" /></span>
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground">{n.kind}</p>
                  <p className="mt-1 font-bold">{n.title}</p>
                  {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                  {n.link && <a href={n.link} className="text-sm font-semibold text-primary">Öffnen</a>}
                  <p className="mt-2 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString("de-DE")}</p>
                </div>
              </article>
            ))}

            {hydrated && notifications.map((n) => (
              <article key={n.id} className="flex gap-4 rounded-lg border border-dashed bg-card p-4">
                <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground"><Bell className="size-4" /></span>
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground">{n.kind} · lokal</p>
                  <p className="mt-1 font-bold">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.text}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString("de-DE")}</p>
                </div>
              </article>
            ))}

            {empty && (
              <EmptyState icon={Bell} title="Keine Benachrichtigungen" text="Sobald sich jemand auf Ihren Auftrag bewirbt oder Ihnen schreibt, erscheint hier eine Meldung." actionLabel="Zum Marketplace" />
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
