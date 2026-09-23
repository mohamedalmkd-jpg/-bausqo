import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
import { useAuth, type AccountType } from "@/lib/auth";
import { OAuthButtons } from "@/components/oauth-buttons";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search["redirect"] === "string" ? (search["redirect"] as string) : undefined,
    mode: search["mode"] === "signup" ? ("signup" as const) : ("signin" as const),
  }),
  head: () => ({
    meta: [
      { title: "Anmelden · BAUSQO" },
      { name: "description", content: "Melden Sie sich bei BAUSQO an oder erstellen Sie ein kostenloses Konto für Fachkräfte, Teams und Bauunternehmen." },
      { property: "og:title", content: "Anmelden · BAUSQO" },
      { property: "og:description", content: "Konto für Fachkräfte, Teams und Bauunternehmen." },
    ],
  }),
  component: AuthPage,
});

const accountTypes: { value: AccountType; label: string; hint: string }[] = [
  { value: "worker", label: "Fachkraft / Selbstständig", hint: "Arbeit und Aufträge finden" },
  { value: "team", label: "Team / Kolonne", hint: "Als Team Aufträge übernehmen" },
  { value: "company", label: "Bauunternehmen", hint: "Aufträge erstellen und Personal finden" },
];

function safePath(value: string | undefined) {
  if (!value) return "/dashboard";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

function AuthPage() {
  const { redirect, mode } = Route.useSearch();
  const navigate = useNavigate();
  const { session, ready, profile, signIn, signUp } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">(mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("worker");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const target = safePath(redirect);

  useEffect(() => {
    if (!ready || !session) return;
    if (!profile) return;
    if (!profile.onboarding_completed) {
      void navigate({ to: "/konto-typ", replace: true });
      return;
    }
    void navigate({ to: target, replace: true });
  }, [ready, session, profile, target, navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setInfo(null);
    try {
      if (tab === "signin") {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          toast.error(error === "Invalid login credentials" ? "E-Mail oder Passwort ist falsch." : error);
          return;
        }
        toast.success("Angemeldet.");
        void navigate({ to: target, replace: true });
      } else {
        if (displayName.trim().length < 2) {
          toast.error("Bitte einen Namen angeben.");
          return;
        }
        const { error, needsConfirmation } = await signUp(email.trim(), password, {
          display_name: displayName.trim(),
          account_type: accountType,
          ...(accountType === "company" ? { company_name: companyName.trim() } : {}),
        });
        if (error) {
          toast.error(error);
          return;
        }
        if (needsConfirmation) {
          setInfo(
            "Konto angelegt. Bitte bestätigen Sie die E-Mail-Adresse über den Link, den wir Ihnen gesendet haben – danach ist die Anmeldung möglich.",
          );
          return;
        }
        toast.success("Konto erstellt.");
        void navigate({ to: target, replace: true });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <PublicHeader />

      <main className="bausqo-page relative overflow-hidden px-4 py-12 sm:py-16">
        <div className="pointer-events-none absolute left-1/2 top-24 size-[30rem] -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-1/3 size-72 rounded-full bg-primary/8 blur-3xl" />

        <div className="relative mx-auto grid w-full max-w-5xl gap-7 lg:grid-cols-[.82fr_1.18fr]">
          <aside className="bausqo-grid-dark hidden overflow-hidden rounded-[2rem] bg-brand-dark p-8 text-white shadow-2xl lg:block">
            <div className="flex h-full flex-col">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/25 bg-amber-200/[0.08] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-amber-200">
                <Sparkles className="size-3.5" />
                BAUSQO ACCESS
              </span>
              <h1 className="mt-8 text-4xl font-black leading-tight tracking-[-0.045em]">
                Ein Zugang.
                <br />
                Dein ganzer <span className="text-primary">Workspace.</span>
              </h1>
              <p className="mt-4 text-sm leading-7 text-white/50">
                Melde dich an und wechsle ohne Umwege zwischen Aufträgen, Matches, Nachrichten und deinem Profil.
              </p>

              <div className="mt-8 grid gap-3">
                {[
                  "Schnelle Anmeldung und Registrierung",
                  "Google / Apple Login, soweit aktiviert",
                  "Geschützte Sitzungen und Kontodaten",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3.5 text-sm font-bold text-white/72">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
                      <ShieldCheck className="size-4" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-10">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/25">Bau. Match. Business.</p>
              </div>
            </div>
          </aside>

          <div className="bausqo-auth-card relative overflow-hidden rounded-[2rem] p-[1px] shadow-2xl">
            <div className="bausqo-auth-shine" aria-hidden="true" />
            <div className="relative rounded-[calc(2rem-1px)] bg-card p-6 sm:p-8">
              <div className="mb-6 text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/45 bg-amber-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-800">
                  <Sparkles className="size-3.5" />
                  Secure Access
                </span>
                <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">
                  {tab === "signin" ? "Willkommen zurück" : "BAUSQO Konto erstellen"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {tab === "signin" ? "Melde dich an und arbeite direkt weiter." : "Wähle deinen Kontotyp und starte kostenlos."}
                </p>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
                {(["signin", "signup"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTab(value)}
                    className={`h-10 rounded-lg text-sm font-bold transition-all ${tab === value ? "bausqo-auth-tab-active text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {value === "signin" ? "Anmelden" : "Registrieren"}
                  </button>
                ))}
              </div>

              {redirect && (
                <p className="mb-4 rounded-xl border border-brand-orange/30 bg-brand-orange/10 p-3 text-sm">
                  Bitte anmelden oder registrieren, um fortzufahren.
                </p>
              )}
              {info && <p className="mb-4 rounded-xl border bg-muted/50 p-3 text-sm">{info}</p>}

              <OAuthButtons mode={tab} redirect={target} />

              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                {tab === "signup" ? "Oder mit E-Mail registrieren" : "Oder mit E-Mail anmelden"}
                <span className="h-px flex-1 bg-border" />
              </div>

              <form className="space-y-4" onSubmit={submit}>
                {tab === "signup" && (
                  <>
                    <div className="space-y-2">
                      <Label>Kontotyp</Label>
                      <div className="grid gap-2">
                        {accountTypes.map((t) => (
                          <button
                            type="button"
                            key={t.value}
                            onClick={() => setAccountType(t.value)}
                            className={`rounded-xl border p-3 text-left transition-all ${accountType === t.value ? "border-amber-400/60 bg-amber-50 shadow-sm" : "hover:border-primary/40"}`}
                          >
                            <span className="block text-sm font-semibold">{t.label}</span>
                            <span className="block text-xs text-muted-foreground">{t.hint}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                    </div>
                    {accountType === "company" && (
                      <div className="space-y-2">
                        <Label htmlFor="company">Firmenname</Label>
                        <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Passwort</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={tab === "signin" ? "current-password" : "new-password"}
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="bausqo-auth-submit h-12 w-full rounded-xl font-black" disabled={busy}>
                  {busy && <Loader2 className="animate-spin" />}
                  {tab === "signin" ? "Anmelden" : "Kostenlos registrieren"}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
                Mit der Registrierung stimmst du der Verarbeitung deiner Angaben zur Nutzung von BAUSQO zu.{" "}
                <Link to="/datenschutz" className="font-bold underline">Datenschutz</Link>
                {" · "}
                <Link to="/impressum" className="font-bold underline">Impressum</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
