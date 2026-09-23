import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PublicHeader } from "@/components/public-header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { accountTypeOptions, companyAccountTypes, type AccountTypeValue } from "@/lib/account-types";

export const Route = createFileRoute("/konto-typ")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Kontoart wählen · BauMatch" },
      { name: "description", content: "Wählen Sie Ihre Kontoart bei BauMatch – von Arbeitssuchend bis Generalunternehmer." },
      { property: "og:title", content: "Kontoart wählen · BauMatch" },
      { property: "og:description", content: "Kontoart für Ihr BauMatch-Profil festlegen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountTypePage,
});

function AccountTypePage() {
  const navigate = useNavigate();
  const { ready, session, profile, refreshProfile } = useAuth();
  const [selected, setSelected] = useState<AccountTypeValue | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && !session) void navigate({ to: "/auth", search: { mode: "signin", redirect: "/konto-typ" }, replace: true });
  }, [ready, session, navigate]);

  useEffect(() => {
    if (!profile) return;
    setDisplayName((prev) => (prev ? prev : profile.display_name));
    setCompanyName((prev) => (prev ? prev : (profile.company_name ?? "")));
    setPhone((prev) => (prev ? prev : (profile.phone ?? "")));
  }, [profile]);

  async function save() {
    if (!selected) {
      toast.error("Bitte eine Kontoart auswählen.");
      return;
    }
    if (displayName.trim().length < 2) {
      toast.error("Bitte einen Namen angeben.");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        account_type: selected,
        display_name: displayName.trim(),
        company_name: companyName.trim() || null,
        phone: phone.trim() || null,
        onboarding_completed: true,
      })
      .eq("id", session!.user.id);
    setBusy(false);
    if (error) {
      toast.error("Die Angaben konnten nicht gespeichert werden. Bitte erneut versuchen.");
      return;
    }
    await refreshProfile();
    toast.success("Profil eingerichtet.");
    void navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <PublicHeader />
      <main className="mx-auto w-full max-w-2xl px-4 py-10">
        <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold">Willkommen bei BauMatch</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Damit wir passende Ergebnisse zeigen: Wofür nutzen Sie BauMatch?
          </p>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {accountTypeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelected(option.value)}
                className={`rounded-lg border p-3 text-left transition-colors ${selected === option.value ? "border-primary bg-primary/5" : "hover:border-primary/40"}`}
              >
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="block text-xs text-muted-foreground">{option.hint}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            {selected && companyAccountTypes.includes(selected) && (
              <div className="space-y-2">
                <Label htmlFor="company">Firma / Team</Label>
                <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon (optional)</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <Button className="mt-6 w-full" onClick={() => void save()} disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            Weiter zum Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}
