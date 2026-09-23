import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PublicHeader } from "@/components/public-header";
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
    // Profil erst abwarten, damit neue OAuth-Konten zur Kontoart-Auswahl kommen.
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
      <main className="bausqo-page mx-auto w-full max-w-md px-4 py-12">
        <div className="bausqo-panel overflow-hidden rounded-[1.6rem] p-6 shadow-xl sm:p-8">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            {(["signin", "signup"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`h-10 rounded-lg text-sm font-bold transition-all ${tab === value ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {value === "signin" ? "Anmelden" : "Registrieren"}
              </button>
            ))}
          </div>

          {redirect && (
            <p className="mb-4 rounded-md border border-brand-orange/30 bg-brand-orange/10 p-3 text-sm">
              Bitte anmelden oder registrieren, um fortzufahren.
            </p>
          )}
          {info && <p className="mb-4 rounded-md border bg-muted/50 p-3 text-sm">{info}</p>}

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
                        className={`rounded-lg border p-3 text-left transition-colors ${accountType === t.value ? "border-primary bg-primary/5" : "hover:border-primary/40"}`}
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

            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />}
              {tab === "signin" ? "Anmelden" : "Kostenlos registrieren"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Mit der Registrierung stimmen Sie der Verarbeitung Ihrer Angaben zur Nutzung von BAUSQO zu.{" "}
            <Link to="/" className="underline">Zur Startseite</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
