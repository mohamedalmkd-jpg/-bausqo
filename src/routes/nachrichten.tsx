import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Loader2, MessageSquare, Plus, Search, Send } from "lucide-react";
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
      { title: "Nachrichten – BAUSQO" },
      { name: "description", content: "Projektkommunikation, Anfragen und Absprachen direkt in BAUSQO." },
      { property: "og:title", content: "Nachrichten – BAUSQO" },
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
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [threadQuery, setThreadQuery] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    setError(null);

    const { data, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .order("last_message_at", { ascending: false });

    if (convError) {
      setError(convError.message);
      return;
    }

    const convs = (data ?? []) as Conversation[];
    setConversations(convs);
    setActiveConversationId((current) => current ?? convs[0]?.id ?? null);

    const { data: msgs } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
    const grouped: Record<string, Message[]> = {};
    for (const m of (msgs ?? []) as Message[]) {
      (grouped[m.conversation_id] ??= []).push(m);
    }
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
      .channel("messages:" + user.id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => void load())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversations" }, () => void load())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user, load]);

  const filteredConversations = useMemo(() => {
    const q = threadQuery.trim().toLowerCase();
    if (!q) return conversations ?? [];
    return (conversations ?? []).filter((conversation) =>
      (conversation.subject ?? "Unterhaltung").toLowerCase().includes(q)
    );
  }, [conversations, threadQuery]);

  const activeConversation =
    (conversations ?? []).find((conversation) => conversation.id === activeConversationId) ??
    (conversations ?? [])[0] ??
    null;

  if (!ready) {
    return (
      <AppShell>
        <div className="grid h-64 place-items-center"><Loader2 className="animate-spin" /></div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="bausqo-page mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">COMMUNICATION HUB</p>
            <h1 className="mt-1 text-3xl font-black tracking-[-0.04em]">Nachrichten</h1>
            <p className="mt-2 text-sm text-muted-foreground">Projektkommunikation, Kontakte und Rückfragen in einem Arbeitsbereich.</p>
          </div>

          {user && (
            <Dialog open={newOpen} onOpenChange={setNewOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl"><Plus /> Neuer Chat</Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Neue Unterhaltung</DialogTitle>
                  <DialogDescription>Schreibe direkt mit einer Fachkraft, einem Team oder Unternehmen auf BAUSQO.</DialogDescription>
                </DialogHeader>
                <Select value={newRecipient} onValueChange={setNewRecipient}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Kontakt auswählen" /></SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.company_name || contact.display_name || "BAUSQO Nutzer"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea className="rounded-xl" rows={4} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Nachricht schreiben …" />
                <Button
                  className="rounded-xl"
                  disabled={sendingNew || !newRecipient || newMessage.trim().length < 2}
                  onClick={async () => {
                    if (!user) return;
                    const contact = contacts.find((item) => item.id === newRecipient);
                    if (!contact) return;
                    setSendingNew(true);
                    try {
                      await startDirectConversation({
                        senderId: user.id,
                        recipientId: contact.id,
                        recipientName: contact.company_name || contact.display_name || "BAUSQO Nutzer",
                        body: newMessage.trim(),
                      });
                      setNewMessage("");
                      setNewRecipient("");
                      setNewOpen(false);
                      toast.success("Unterhaltung gestartet.");
                      await load();
                    } catch (e) {
                      toast.error("Chat konnte nicht gestartet werden: " + (e as Error).message);
                    } finally {
                      setSendingNew(false);
                    }
                  }}
                >
                  {sendingNew ? <Loader2 className="animate-spin" /> : <Send />}
                  Nachricht senden
                </Button>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {!user ? (
          <div className="premium-panel rounded-2xl p-6">
            <EmptyState icon={MessageSquare} title="Bitte anmelden" text="Nachrichten sind an dein Konto gebunden. Melde dich an, um Unterhaltungen zu sehen." />
            <Button className="mt-4 rounded-xl" asChild>
              <Link to="/auth" search={{ redirect: "/nachrichten", mode: "signin" }}>Anmelden</Link>
            </Button>
          </div>
        ) : error ? (
          <div className="premium-panel rounded-2xl p-6">
            <EmptyState icon={MessageSquare} title="Nachrichten konnten nicht geladen werden" text={error} />
            <Button className="mt-4 rounded-xl" onClick={() => void load()}>Erneut versuchen</Button>
          </div>
        ) : !conversations ? (
          <div className="grid h-64 place-items-center"><Loader2 className="animate-spin" /></div>
        ) : conversations.length === 0 ? (
          <div className="premium-panel rounded-2xl p-6">
            <EmptyState icon={MessageSquare} title="Keine Unterhaltungen" text="Über „Kontakt aufnehmen“ auf einer Auftragsseite startest du eine Unterhaltung." actionLabel="Zum Marketplace" />
          </div>
        ) : (
          <div className="premium-panel grid min-h-[650px] overflow-hidden rounded-[1.5rem] lg:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="border-b bg-muted/20 lg:border-b-0 lg:border-r">
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">INBOX</p>
                    <p className="mt-1 font-black">{conversations.length} Unterhaltungen</p>
                  </div>
                  <span className="bausqo-live size-2 rounded-full bg-emerald-500" />
                </div>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <input
                    value={threadQuery}
                    onChange={(event) => setThreadQuery(event.target.value)}
                    placeholder="Unterhaltungen suchen…"
                    className="h-10 w-full rounded-xl border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/15"
                  />
                </div>
              </div>

              <div className="max-h-[250px] overflow-y-auto p-2 lg:max-h-[570px]">
                {filteredConversations.map((conversation) => {
                  const active = activeConversation?.id === conversation.id;
                  const count = messages[conversation.id]?.length ?? 0;
                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => setActiveConversationId(conversation.id)}
                      className={[
                        "mb-1 flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors",
                        active ? "bg-brand-dark text-white shadow-lg" : "hover:bg-muted/70",
                      ].join(" ")}
                    >
                      <span className={["grid size-10 shrink-0 place-items-center rounded-xl font-black", active ? "bg-white/10 text-white" : "bg-primary/10 text-primary"].join(" ")}>
                        {(conversation.subject ?? "U").slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black">{conversation.subject ?? "Unterhaltung"}</span>
                        <span className={["mt-0.5 block truncate text-[10px]", active ? "text-white/50" : "text-muted-foreground"].join(" ")}>
                          {count} Nachricht{count === 1 ? "" : "en"} · {new Date(conversation.last_message_at).toLocaleDateString("de-DE")}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {activeConversation && (
              <section className="grid min-w-0 grid-rows-[auto_1fr_auto]">
                <div className="flex items-center justify-between gap-4 border-b p-4 sm:p-5">
                  <div className="min-w-0">
                    <p className="truncate text-base font-black">{activeConversation.subject ?? "Unterhaltung"}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Letzte Aktivität {new Date(activeConversation.last_message_at).toLocaleString("de-DE")}
                    </p>
                  </div>
                  {activeConversation.job_id && (
                    <Button asChild variant="outline" size="sm" className="rounded-xl">
                      <Link to="/auftrag/$id" params={{ id: activeConversation.job_id }}>
                        Zum Auftrag <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  )}
                </div>

                <div className="flex max-h-[500px] min-h-[390px] flex-col gap-3 overflow-y-auto bg-muted/15 p-4 sm:p-6">
                  {(messages[activeConversation.id] ?? []).map((message) => {
                    const mine = message.sender_id === user.id;
                    return (
                      <div
                        key={message.id}
                        className={[
                          "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[72%]",
                          mine
                            ? "ml-auto rounded-br-md bg-primary text-primary-foreground"
                            : "rounded-bl-md border bg-card",
                        ].join(" ")}
                      >
                        {message.body}
                        <span className={["mt-1 block text-[9px]", mine ? "text-primary-foreground/55" : "text-muted-foreground"].join(" ")}>
                          {new Date(message.created_at).toLocaleString("de-DE")}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t bg-background p-3 sm:p-4">
                  <div className="flex items-end gap-2 rounded-2xl border bg-muted/25 p-2">
                    <Textarea
                      rows={2}
                      className="min-h-[52px] flex-1 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
                      value={draft[activeConversation.id] ?? ""}
                      placeholder="Nachricht schreiben …"
                      onChange={(event) =>
                        setDraft((previous) => ({ ...previous, [activeConversation.id]: event.target.value }))
                      }
                    />
                    <Button
                      className="size-11 rounded-xl p-0"
                      onClick={async () => {
                        const body = (draft[activeConversation.id] ?? "").trim();
                        if (body.length < 2) return;
                        const { error: sendError } = await supabase.from("messages").insert({
                          conversation_id: activeConversation.id,
                          sender_id: user.id,
                          body,
                        });
                        if (sendError) {
                          toast.error("Senden fehlgeschlagen: " + sendError.message);
                          return;
                        }
                        setDraft((previous) => ({ ...previous, [activeConversation.id]: "" }));
                        toast.success("Nachricht gesendet.");
                        void load();
                      }}
                    >
                      <Send className="size-4" />
                    </Button>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
