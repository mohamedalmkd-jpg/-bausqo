import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loader2, MessageSquare, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { startDirectConversation } from "@/lib/jobs";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/nachrichten")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nachrichten – BauMatch" },
      { name: "description", content: "Unterhaltungen zu Bauaufträgen: Anfragen, Rückfragen und Absprachen mit Auftraggebern und Fachkräften." },
      { property: "og:title", content: "Nachrichten – BauMatch" },
      { property: "og:description", content: "Projektkommunikation an einem Ort." },
    ],
  }),
  component: MessagesPage,
});

type Conversation = { id: string; job_id: string | null; subject: string | null; created_by: string; recipient_id: string; last_message_at: string };
type Message = { id: string; conversation_id: string; sender_id: string; body: string; created_at: string };
type Contact = { id: string; display_name: string; company_name: string | null; account_type: string };

function MessagesPage() {
  const { user, ready } = useAuth();
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newRecipient, setNewRecipient] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [sendingNew, setSendingNew] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setError(null);
    const { data, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .order("last_message_at", { ascending: false });
    if (convError) { setError(convError.message); return; }
    const convs = (data ?? []) as Conversation[];
    setConversations(convs);
    const { data: msgs } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
    const grouped: Record<string, Message[]> = {};
    for (const m of (msgs ?? []) as Message[]) (grouped[m.conversation_id] ??= []).push(m);
    setMessages(grouped);
    const { data: profileRows } = await supabase
      .from("profiles")
      .select("id,display_name,company_name,account_type")
      .neq("id", user.id)
      .order("display_name");
    setContacts((profileRows ?? []) as Contact[]);
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`messages:${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => void load())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversations" }, () => void load())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user, load]);

  if (!ready) return <AppShell><div className="grid h-64 place-items-center"><Loader2 className="animate-spin" /></div></AppShell>;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-extrabold">Nachrichten</h1>
          {user && (
            <Dialog open={newOpen} onOpenChange={setNewOpen}>
              <DialogTrigger asChild><Button><Plus /> Neuer Chat</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neue Unterhaltung</DialogTitle>
                  <DialogDescription>Schreiben Sie direkt mit einer Fachkraft, einem Team oder Unternehmen auf BauSqo.</DialogDescription>
                </DialogHeader>
                <Select value={newRecipient} onValueChange={setNewRecipient}>
                  <SelectTrigger><SelectValue placeholder="Kontakt auswählen" /></SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.company_name || contact.display_name || "BauSqo Nutzer"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea rows={4} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Nachricht schreiben …" />
                <Button disabled={sendingNew || !newRecipient || newMessage.trim().length < 2} onClick={async () => {
                  if (!user) return;
                  const contact = contacts.find((item) => item.id === newRecipient);
                  if (!contact) return;
                  setSendingNew(true);
                  try {
                    await startDirectConversation({
                      senderId: user.id,
                      recipientId: contact.id,
                      recipientName: contact.company_name || contact.display_name || "BauSqo Nutzer",
                      body: newMessage.trim(),
                    });
                    setNewMessage("");
                    setNewRecipient("");
                    setNewOpen(false);
                    toast.success("Unterhaltung gestartet.");
                    await load();
                  } catch (e) {
                    toast.error(`Chat konnte nicht gestartet werden: ${(e as Error).message}`);
                  } finally {
                    setSendingNew(false);
                  }
                }}>
                  {sendingNew ? <Loader2 className="animate-spin" /> : <Send />} Nachricht senden
                </Button>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {!user ? (
          <div className="mt-6">
            <EmptyState icon={MessageSquare} title="Bitte anmelden" text="Nachrichten sind an Ihr Konto gebunden. Melden Sie sich an, um Unterhaltungen zu sehen." />
            <Button className="mt-4" asChild><Link to="/auth" search={{ redirect: "/nachrichten", mode: "signin" }}>Anmelden</Link></Button>
          </div>
        ) : error ? (
          <div className="mt-6">
            <EmptyState icon={MessageSquare} title="Nachrichten konnten nicht geladen werden" text={error} />
            <Button className="mt-4" onClick={() => void load()}>Erneut versuchen</Button>
          </div>
        ) : !conversations ? (
          <div className="mt-10 grid place-items-center"><Loader2 className="animate-spin" /></div>
        ) : conversations.length === 0 ? (
          <div className="mt-6">
            <EmptyState icon={MessageSquare} title="Keine Unterhaltungen" text="Über „Kontakt aufnehmen“ auf einer Auftragsseite starten Sie eine Unterhaltung." actionLabel="Zum Marketplace" />
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {conversations.map((c) => (
              <article key={c.id} className="rounded-lg border bg-card p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-extrabold">{c.subject ?? "Unterhaltung"}</p>
                  <span className="text-xs text-muted-foreground">{new Date(c.last_message_at).toLocaleString("de-DE")}</span>
                </div>
                {c.job_id && (
                  <Link to="/auftrag/$id" params={{ id: c.job_id }} className="text-sm font-semibold text-primary">Zum Auftrag</Link>
                )}
                <div className="mt-3 space-y-2">
                  {(messages[c.id] ?? []).map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-[85%] rounded-lg p-3 text-sm leading-6 ${m.sender_id === user.id ? "ml-auto bg-primary/10" : "bg-muted"}`}
                    >
                      {m.body}
                      <span className="mt-1 block text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleString("de-DE")}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <Textarea
                    rows={2}
                    value={draft[c.id] ?? ""}
                    placeholder="Antwort schreiben …"
                    onChange={(e) => setDraft((prev) => ({ ...prev, [c.id]: e.target.value }))}
                  />
                  <Button
                    onClick={async () => {
                      const body = (draft[c.id] ?? "").trim();
                      if (body.length < 2) return;
                      const { error: sendError } = await supabase.from("messages").insert({ conversation_id: c.id, sender_id: user.id, body });
                      if (sendError) { toast.error(`Senden fehlgeschlagen: ${sendError.message}`); return; }
                      setDraft((prev) => ({ ...prev, [c.id]: "" }));
                      toast.success("Nachricht gesendet.");
                      void load();
                    }}
                  >
                    <Send />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
