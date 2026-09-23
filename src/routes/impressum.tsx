import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/impressum")({
  head: () => ({
    meta: [
      { title: "Impressum · BAUSQO" },
      { name: "description", content: "Impressum und Anbieterinformationen der BAUSQO Plattform." },
    ],
  }),
  component: ImprintPage,
});

function ImprintPage() {
  return (
    <div className="min-h-screen bg-muted/25">
      <PublicHeader />
      <main className="bausqo-page mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border bg-card shadow-xl">
          <div className="bausqo-grid-dark bg-brand-dark px-6 py-10 text-white sm:px-10">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Rechtliches / Anbieter</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">Impressum</h1>
          </div>

          <div className="space-y-8 p-6 sm:p-10">
            <div className="flex gap-3 rounded-2xl border border-amber-300/55 bg-amber-50 p-4 text-amber-950">
              <AlertTriangle className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-black">Vor Veröffentlichung vervollständigen</p>
                <p className="mt-1 text-sm leading-6">Die folgenden Betreiberangaben dürfen nicht erfunden werden. Ergänze vor dem öffentlichen Launch deine echten Unternehmens- bzw. Betreiberinformationen.</p>
              </div>
            </div>

            <section>
              <h2 className="text-xl font-black">Angaben gemäß § 5 DDG</h2>
              <div className="mt-4 rounded-2xl border bg-muted/30 p-5 text-sm leading-7">
                <p><strong>Plattform:</strong> BAUSQO</p>
                <p><strong>Betreiber / Firma:</strong> [bitte ergänzen]</p>
                <p><strong>Vertretungsberechtigte Person:</strong> [falls zutreffend ergänzen]</p>
                <p><strong>Ladungsfähige Anschrift:</strong> [bitte ergänzen]</p>
                <p><strong>E-Mail:</strong> [bitte ergänzen]</p>
                <p><strong>Telefon:</strong> [optional / falls vorhanden]</p>
                <p><strong>USt-IdNr.:</strong> [falls vorhanden]</p>
                <p><strong>Registerangaben:</strong> [falls vorhanden]</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-black">Kontakt</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Für Plattformanfragen steht bereits das BAUSQO Kontaktformular zur Verfügung.
              </p>
              <Link to="/kontakt" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-primary">
                Kontakt öffnen <ArrowRight className="size-4" />
              </Link>
            </section>

            <section>
              <h2 className="text-xl font-black">Haftung für Inhalte</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Eigene Inhalte werden mit angemessener Sorgfalt erstellt. Für von Nutzern eingestellte Projekt-, Profil- oder Angebotsinformationen sind die jeweiligen Nutzer im Rahmen der gesetzlichen Vorgaben selbst verantwortlich.
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
