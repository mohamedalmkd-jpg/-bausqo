import { FormEvent, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    setBusy(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: normalizedEmail, source: "website" });

      if (error) {
        if (error.code === "23505") {
          toast.success("Diese E-Mail ist bereits für BAUSQO eingetragen.");
          setEmail("");
          return;
        }
        throw error;
      }

      toast.success("Newsletter abonniert. Willkommen bei BAUSQO.");
      setEmail("");
    } catch (error) {
      console.error(error);
      toast.error("Das Abonnement konnte gerade nicht gespeichert werden.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <footer className="mt-10 border-t border-white/8 bg-brand-dark text-white">
      <div className="bausqo-grid-dark">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_.8fr_1.2fr] lg:px-8">
          <div>
            <Brand inverse />
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/48">
              BAUSQO verbindet Bauunternehmen, Teams, Fachkräfte und Auftraggeber in einem modernen Workspace.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-bold text-white/55">
              <ShieldCheck className="size-3.5 text-primary" />
              Datenschutz & sichere Konten
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.17em] text-white/32">BAUSQO</p>
            <nav className="mt-4 grid gap-3 text-sm font-bold">
              <Link to="/kontakt" className="w-fit text-white/70 hover:text-white">Kontakt</Link>
              <Link to="/mitgliedschaft" className="w-fit text-white/70 hover:text-white">Mitgliedschaft</Link>
              <Link to="/datenschutz" className="w-fit text-white/70 hover:text-white">Datenschutz</Link>
              <Link to="/impressum" className="w-fit text-white/70 hover:text-white">Impressum</Link>
            </nav>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/14 text-primary">
                <Mail className="size-5" />
              </span>
              <div>
                <p className="font-black">BAUSQO abonnieren</p>
                <p className="text-xs text-white/40">Updates zu Funktionen, Aufträgen und Plattform-News.</p>
              </div>
            </div>
            <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={subscribe}>
              <Input
                type="email"
                required
                autoComplete="email"
                placeholder="E-Mail-Adresse"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 border-white/10 bg-white/[0.06] text-white placeholder:text-white/30"
              />
              <Button type="submit" className="h-11 shrink-0 rounded-xl font-black text-brand-dark" disabled={busy}>
                {busy ? "Speichern…" : "Abonnieren"}
                {!busy && <ArrowRight className="size-4" />}
              </Button>
            </form>
            <p className="mt-3 text-[10px] leading-4 text-white/30">
              Mit dem Abonnement stimmst du der Verarbeitung deiner E-Mail für den Newsletter zu. Abmeldung ist jederzeit möglich.
            </p>
          </div>
        </div>

        <div className="border-t border-white/8">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-[11px] text-white/30 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <span>© 2026 BAUSQO. Alle Rechte vorbehalten.</span>
            <span>Bau. Match. Business.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
