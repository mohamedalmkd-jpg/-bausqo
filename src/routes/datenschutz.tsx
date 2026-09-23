import { createFileRoute } from "@tanstack/react-router";
import { Database, LockKeyhole, ShieldCheck, UserRoundCheck } from "lucide-react";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/datenschutz")({
  head: () => ({
    meta: [
      { title: "Datenschutz · BAUSQO" },
      { name: "description", content: "Datenschutzhinweise für die Nutzung der BAUSQO Plattform." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-muted/25">
      <PublicHeader />
      <main className="bausqo-page mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border bg-card shadow-xl">
          <div className="bausqo-grid-dark bg-brand-dark px-6 py-10 text-white sm:px-10">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Rechtliches / Datenschutz</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">Datenschutzerklärung</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/48">Stand: 23. September 2026</p>
          </div>

          <div className="space-y-9 p-6 sm:p-10">
            <div className="rounded-2xl border border-amber-300/50 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              <strong>Vor dem öffentlichen Launch ergänzen:</strong> Name/Firma des Verantwortlichen, ladungsfähige Anschrift und eine gültige Kontakt-E-Mail müssen im Impressum hinterlegt werden.
            </div>

            <section>
              <h2 className="text-xl font-black">1. Verantwortlicher</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Verantwortlich für die Datenverarbeitung auf BAUSQO ist der im Impressum genannte Betreiber der Plattform. Die vollständigen Betreiber- und Kontaktdaten werden dort veröffentlicht.
              </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              {[
                [UserRoundCheck, "Konto & Profil", "Anmeldedaten, Kontotyp, Profilinformationen und Angaben, die du freiwillig für dein Profil hinterlegst."],
                [Database, "Plattformdaten", "Aufträge, Bewerbungen, Nachrichten, gespeicherte Inhalte, Kontaktanfragen und technische Protokolle."],
                [LockKeyhole, "Authentifizierung", "Anmeldung per E-Mail sowie – soweit aktiviert – über externe Login-Anbieter wie Google oder Apple."],
                [ShieldCheck, "Newsletter", "Deine E-Mail wird nur für BAUSQO Updates verarbeitet, wenn du das Abonnement selbst abschickst."],
              ].map(([Icon, title, text]) => {
                const ItemIcon = Icon as typeof ShieldCheck;
                return (
                  <div key={String(title)} className="rounded-2xl border bg-muted/25 p-5">
                    <ItemIcon className="size-5 text-primary" />
                    <h3 className="mt-3 font-black">{String(title)}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{String(text)}</p>
                  </div>
                );
              })}
            </section>

            <section>
              <h2 className="text-xl font-black">2. Zwecke und Rechtsgrundlagen</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Wir verarbeiten Daten, um Konten bereitzustellen, Plattformfunktionen auszuführen, Aufträge und Kommunikation zu ermöglichen, Sicherheit und Stabilität zu gewährleisten sowie Anfragen zu beantworten. Soweit die Verarbeitung zur Vertragserfüllung erforderlich ist, erfolgt sie auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO. Sicherheits- und Betriebsinteressen können auf Art. 6 Abs. 1 lit. f DSGVO beruhen. Newsletter-E-Mails werden auf Grundlage deiner Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO verarbeitet.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black">3. Technische Dienstleister</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                BAUSQO nutzt technische Infrastruktur und Dienste für Hosting, Datenbank, Authentifizierung und Bereitstellung der Anwendung. Dazu gehören insbesondere Supabase für Backend-, Datenbank- und Authentifizierungsfunktionen sowie Vercel für die Bereitstellung der Webanwendung. Bei aktivierten externen Logins können zusätzlich die jeweiligen Login-Anbieter Daten verarbeiten.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black">4. Speicherung und Löschung</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Personenbezogene Daten werden nur so lange gespeichert, wie sie für den jeweiligen Zweck benötigt werden oder gesetzliche Aufbewahrungspflichten bestehen. Kontaktanfragen und Kontodaten können nach Erledigung bzw. Beendigung des Kontos gelöscht oder eingeschränkt werden, soweit keine Pflicht zur weiteren Aufbewahrung besteht.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black">5. Deine Rechte</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Du hast nach Maßgabe der DSGVO insbesondere Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Erteilte Einwilligungen können mit Wirkung für die Zukunft widerrufen werden. Zudem besteht ein Beschwerderecht bei einer zuständigen Datenschutzaufsichtsbehörde.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black">6. Sicherheit</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                BAUSQO setzt Zugriffsbeschränkungen, rollenbasierte Datenbankregeln und weitere technische Maßnahmen ein, um Daten vor unbefugtem Zugriff zu schützen. Trotzdem kann eine absolute Sicherheit bei der Datenübertragung im Internet nicht garantiert werden.
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
