import { FormEvent, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Mail, MessageSquareText, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/kontakt")({
  head: () => ({
    meta: [
      { title: "Kontakt · BAUSQO" },
      { name: "description", content: "Kontaktieren Sie BAUSQO bei Fragen zur Plattform, zu Konten oder zur Zusammenarbeit." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);

    try {
      const { error } = await supabase.from("contact_requests").insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
      });

      if (error) throw error;

      toast.success("Deine Anfrage wurde an BAUSQO übermittelt.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error(error);
      toast.error("Die Anfrage konnte gerade nicht gesendet werden.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <PublicHeader />
      <main className="bausqo-page mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="bausqo-public-premium-card grid overflow-hidden rounded-[2rem] bg-brand-dark text-white shadow-2xl lg:grid-cols-[.8fr_1.2fr]">
          <div className="bausqo-grid-dark relative p-7 sm:p-10">
            <div className="pointer-events-none absolute -left-20 top-8 size-60 rounded-full bg-primary/12 blur-3xl" />
            <div className="relative">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Kontakt / BAUSQO</p>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl">Wie können wir helfen?</h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/52">
                Fragen zur Plattform, zu deinem Konto, zu Mitgliedschaften oder zu einer geschäftlichen Zusammenarbeit kannst du direkt hier senden.
              </p>

              <div className="mt-8 grid gap-3">
                {[
                  [MessageSquareText, "Direkte Anfrage", "Deine Nachricht landet im BAUSQO-System."],
                  [ShieldCheck, "Geschützt", "Kontaktdaten sind nicht öffentlich einsehbar."],
                  [Mail, "E-Mail inklusive", "So kann eine Antwort deiner Anfrage zugeordnet werden."],
                ].map(([Icon, title, text]) => {
                  const ItemIcon = Icon as typeof Mail;
                  return (
                    <div key={String(title)} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                        <ItemIcon className="size-5" />
                      </span>
                      <div>
                        <p className="text-sm font-black">{String(title)}</p>
                        <p className="mt-1 text-xs leading-5 text-white/42">{String(text)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-background p-6 text-foreground sm:p-10">
            <div className="mx-auto max-w-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Nachricht senden</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">Kontaktformular</h2>
              <form className="mt-7 space-y-4" onSubmit={submit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Name</Label>
                    <Input id="contact-name" required minLength={2} maxLength={120} value={name} onChange={(event) => setName(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">E-Mail</Label>
                    <Input id="contact-email" type="email" required maxLength={320} value={email} onChange={(event) => setEmail(event.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-subject">Betreff</Label>
                  <Input id="contact-subject" required minLength={2} maxLength={160} value={subject} onChange={(event) => setSubject(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message">Nachricht</Label>
                  <Textarea
                    id="contact-message"
                    required
                    minLength={10}
                    maxLength={5000}
                    rows={7}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className="resize-y"
                  />
                </div>
                <Button type="submit" className="h-12 w-full rounded-xl font-black text-brand-dark" disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  {busy ? "Wird gesendet…" : "Anfrage senden"}
                </Button>
                <p className="text-xs leading-5 text-muted-foreground">
                  Details zur Verarbeitung findest du in der Datenschutzerklärung.
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
