import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  Crown,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { PublicHeader } from "@/components/public-header";
import { PlanBadge, type MembershipPlan } from "@/components/plan-badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/mitgliedschaft")({
  head: () => ({
    meta: [
      { title: "Mitgliedschaft – BAUSQO" },
      { name: "description", content: "FREE, PRO und BUSINESS Mitgliedschaften für BAUSQO." },
      { property: "og:title", content: "BAUSQO Mitgliedschaften" },
      { property: "og:description", content: "Wähle den passenden BAUSQO Tarif für deine Arbeit in der Bauwirtschaft." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: MembershipPage,
});

type Plan = {
  id: MembershipPlan;
  price: number;
  description: string;
  audience: string;
  accent: string;
  glow: string;
  icon: typeof BadgeCheck;
  popular?: boolean;
  features: string[];
  locked?: string[];
};

const plans: Plan[] = [
  {
    id: "FREE",
    price: 0,
    description: "Für den Einstieg und um BAUSQO kennenzulernen.",
    audience: "Einzelne Fachkräfte & neue Nutzer",
    accent: "border-emerald-300/60 bg-gradient-to-b from-emerald-50/80 to-white",
    glow: "shadow-[0_22px_70px_rgba(34,197,94,.12)]",
    icon: BadgeCheck,
    features: [
      "Profil erstellen",
      "Aufträge und Unternehmen durchsuchen",
      "Basis-Matching",
      "Gespeicherte Favoriten",
      "Grundlegende Nachrichten",
    ],
    locked: ["Erweiterte Sichtbarkeit", "Business-Statistiken"],
  },
  {
    id: "PRO",
    price: 29,
    description: "Für aktive Fachkräfte, Selbstständige und Teams.",
    audience: "Aktive Nutzer & Arbeitsteams",
    accent: "border-amber-300/70 bg-gradient-to-b from-amber-50/90 to-white",
    glow: "shadow-[0_26px_90px_rgba(245,158,11,.18)]",
    icon: Crown,
    popular: true,
    features: [
      "Alles aus FREE",
      "Erweiterte Suche & Filter",
      "Höhere Profil-Sichtbarkeit",
      "Mehr gespeicherte Suchen",
      "Priorisierte Match-Vorschläge",
      "PRO Status-Schriftzug",
      "Erweiterte Kontaktfunktionen",
    ],
    locked: ["Mehrbenutzer-Workspace", "Business-Statistiken"],
  },
  {
    id: "BUSINESS",
    price: 79,
    description: "Für Unternehmen, Auftraggeber und Projektteams.",
    audience: "Bauunternehmen & Auftraggeber",
    accent: "border-red-300/70 bg-gradient-to-b from-red-50/85 to-white",
    glow: "shadow-[0_28px_96px_rgba(239,68,68,.17)]",
    icon: Building2,
    features: [
      "Alles aus PRO",
      "BUSINESS Firmenstatus",
      "Mehrere Team-Mitglieder vorbereitet",
      "Erweiterte Projektverwaltung",
      "Mehr Sichtbarkeit für Aufträge",
      "Business-Statistiken vorbereitet",
      "Priorisierte Unternehmensdarstellung",
    ],
  },
];

const comparison = [
  ["Profil & Suche", true, true, true],
  ["Basis-Matching", true, true, true],
  ["Gespeicherte Favoriten", true, true, true],
  ["Erweiterte Filter", false, true, true],
  ["Priorisierte Matches", false, true, true],
  ["Erhöhte Sichtbarkeit", false, true, true],
  ["PRO Status", false, true, false],
  ["BUSINESS Status", false, false, true],
  ["Projektverwaltung+", false, false, true],
  ["Business-Statistiken", false, false, true],
] as const;

function FeatureCheck({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <span className="mx-auto grid size-7 place-items-center rounded-full bg-emerald-100 text-emerald-700">
      <Check className="size-4" />
    </span>
  ) : (
    <span className="mx-auto block h-px w-5 bg-border" />
  );
}

function MembershipPage() {
  const [selected, setSelected] = useState<MembershipPlan>("PRO");

  return (
    <div className="min-h-screen bg-muted/25">
      <PublicHeader />

      <main className="bausqo-page pb-20">
        <section className="px-0 pt-0 sm:px-4 sm:pt-5 lg:px-8">
          <div className="bausqo-grid-dark relative mx-auto max-w-7xl overflow-hidden bg-brand-dark px-6 py-12 text-white shadow-2xl sm:rounded-[2rem] sm:px-10 sm:py-16 lg:px-14">
            <div className="pointer-events-none absolute -right-32 -top-40 size-[36rem] rounded-full bg-primary/18 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-36 left-16 size-80 rounded-full bg-amber-400/8 blur-3xl" />

            <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-[3px] w-9 rounded-full bg-primary" />
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">BAUSQO Mitgliedschaften</p>
                </div>
                <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.03] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                  Ein Tarif, der mit deinem <span className="text-primary">Baugeschäft wächst.</span>
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
                  Starte kostenlos, werde sichtbarer mit PRO oder nutze BUSINESS für einen professionellen Unternehmens-Workspace.
                </p>

                <div className="mt-7 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-2 text-[10px] font-black text-white/60">Keine versteckten Gebühren im Design</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-2 text-[10px] font-black text-white/60">Monatliche Preisstruktur</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-2 text-[10px] font-black text-white/60">Upgrade jederzeit vorbereitet</span>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/30">Tarif-Vorschau</p>
                    <p className="mt-2 text-lg font-black">Dein ausgewählter Plan</p>
                  </div>
                  <Sparkles className="size-5 text-primary" />
                </div>
                <div className="mt-5 flex items-center justify-between rounded-2xl bg-white/[0.05] p-4">
                  <PlanBadge plan={selected} />
                  <div className="text-right">
                    <p className="text-3xl font-black">
                      {selected === "FREE" ? "0 €" : selected === "PRO" ? "29 €" : "79 €"}
                    </p>
                    <p className="text-[10px] text-white/35">{selected === "FREE" ? "dauerhaft" : "pro Monat"}</p>
                  </div>
                </div>
                <p className="mt-4 text-[10px] leading-5 text-white/35">
                  Zahlungsabwicklung ist in diesem UI noch nicht aktiviert. Die Seite zeigt die Tarifstruktur und Nutzerführung.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const active = selected === plan.id;
              return (
                <article
                  key={plan.id}
                  onClick={() => setSelected(plan.id)}
                  className={[
                    "relative cursor-pointer overflow-hidden rounded-[1.7rem] border p-5 transition-all sm:p-6",
                    plan.accent,
                    plan.glow,
                    active ? "ring-4 ring-primary/10 -translate-y-1" : "hover:-translate-y-1",
                  ].join(" ")}
                >
                  <div className="pointer-events-none absolute -right-10 -top-12 size-36 rounded-full bg-white/70 blur-3xl" />
                  {plan.popular && (
                    <span className="absolute right-4 top-4 rounded-full bg-brand-dark px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white shadow-lg">
                      Beliebt
                    </span>
                  )}

                  <div className="relative">
                    <div className="flex items-center gap-3">
                      <span className="grid size-11 place-items-center rounded-xl bg-white/80 shadow-sm">
                        <Icon className="size-5" />
                      </span>
                      <PlanBadge plan={plan.id} />
                    </div>

                    <p className="mt-5 text-xs font-bold text-muted-foreground">{plan.audience}</p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-5xl font-black tracking-[-0.06em]">{plan.price} €</span>
                      <span className="pb-1.5 text-xs font-bold text-muted-foreground">{plan.price === 0 ? "dauerhaft" : "/ Monat"}</span>
                    </div>
                    <p className="mt-4 min-h-12 text-sm leading-6 text-muted-foreground">{plan.description}</p>

                    <div className="my-6 h-px bg-black/7" />

                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm font-semibold">
                          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="size-3.5" />
                          </span>
                          {feature}
                        </li>
                      ))}
                      {plan.locked?.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground/60">
                          <LockKeyhole className="mt-0.5 size-4 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      asChild
                      variant={plan.id === "PRO" ? "default" : "outline"}
                      className="mt-7 h-12 w-full rounded-xl font-black"
                    >
                      <Link to="/auth" search={{ mode: "signup", redirect: "/mitgliedschaft" }}>
                        {plan.id === "FREE" ? "Kostenlos starten" : plan.id + " auswählen"}
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="bausqo-panel overflow-hidden rounded-[1.6rem]">
            <div className="border-b px-5 py-5 sm:px-6">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-primary">Direkt vergleichen</p>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.03em]">Welcher Tarif passt zu dir?</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/25">
                    <th className="px-6 py-4 text-left text-xs font-black text-muted-foreground">Funktion</th>
                    {(["FREE", "PRO", "BUSINESS"] as MembershipPlan[]).map((plan) => (
                      <th key={plan} className="px-4 py-4 text-center"><PlanBadge plan={plan} compact /></th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.map(([feature, free, pro, business]) => (
                    <tr key={feature} className="border-b last:border-b-0">
                      <td className="px-6 py-4 font-bold">{feature}</td>
                      <td className="px-4 py-4"><FeatureCheck enabled={free} /></td>
                      <td className="px-4 py-4"><FeatureCheck enabled={pro} /></td>
                      <td className="px-4 py-4"><FeatureCheck enabled={business} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-10 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            [Zap, "Schneller starten", "FREE hält den Einstieg einfach. PRO und BUSINESS erweitern den Workspace, sobald du mehr brauchst."],
            [Users, "Für jede Größe", "Von Einzelpersonen über Teams bis zu Unternehmen mit mehreren Projekten."],
            [ShieldCheck, "Klare Unterschiede", "Farben, Status und Funktionen zeigen sofort, welcher Plan aktiv ist."],
          ].map(([Icon, title, text]) => {
            const ItemIcon = Icon as typeof Zap;
            return (
              <div key={String(title)} className="bausqo-panel rounded-2xl p-5">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><ItemIcon className="size-5" /></span>
                <h3 className="mt-4 font-black">{String(title)}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{String(text)}</p>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
