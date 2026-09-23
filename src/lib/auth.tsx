import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AccountType = "worker" | "team" | "company";
export type OAuthProviderId = "google" | "apple";

export type AuthProfile = {
  id: string;
  display_name: string;
  account_type: string;
  company_name: string | null;
  city: string | null;
  postal_code: string | null;
  phone: string | null;
  avatar_url: string | null;
  auth_provider: string | null;
  onboarding_completed: boolean;
};

const providerNames: Record<OAuthProviderId, string> = { google: "Google", apple: "Apple" };

/** Übersetzt technische OAuth-Fehler in verständliche deutsche Meldungen. */
export function oauthErrorMessage(provider: OAuthProviderId, raw: unknown): string {
  const name = providerNames[provider];
  const text = (raw instanceof Error ? raw.message : String(raw ?? "")).toLowerCase();
  if (!text) return `Die Anmeldung mit ${name} ist fehlgeschlagen. Bitte erneut versuchen.`;
  if (text.includes("cancel") || text.includes("closed") || text.includes("abort") || text.includes("denied") || text.includes("popup"))
    return `Die Anmeldung mit ${name} wurde abgebrochen.`;
  if (text.includes("provider is not enabled") || text.includes("unsupported provider") || text.includes("not configured") || text.includes("validation_failed"))
    return `Die Anmeldung mit ${name} ist momentan nicht verfügbar.`;
  if (text.includes("already registered") || text.includes("already exists") || text.includes("identity_already_exists"))
    return `Für diese E-Mail-Adresse besteht bereits ein Konto. Bitte melden Sie sich mit der bisherigen Methode an.`;
  if (text.includes("network") || text.includes("fetch") || text.includes("timeout"))
    return `Keine Verbindung zum Anmeldedienst. Bitte Internetverbindung prüfen und erneut versuchen.`;
  return `Die Anmeldung mit ${name} ist fehlgeschlagen. Bitte erneut versuchen.`;
}

type AuthApi = {
  /** false, solange die Sitzung noch aus dem Browser geladen wird. */
  ready: boolean;
  session: Session | null;
  user: User | null;
  profile: AuthProfile | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    meta: { display_name: string; account_type: AccountType; company_name?: string },
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signInWithProvider: (provider: OAuthProviderId) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthApi | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setReady(true);
    });
    void supabase.auth.getSession().then(({ data: got }) => {
      setSession(got.session);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    setProfile((data as AuthProfile | null) ?? null);
  }, [userId]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const signInWithProvider = useCallback(
  async (provider: OAuthProviderId) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth`,
      },
    });

    return { error: error?.message ?? null };
  },
  [],
);

  const api = useMemo<AuthApi>(
    () => ({
      ready,
      session,
      user: session?.user ?? null,
      profile,
      refreshProfile: loadProfile,
      async signIn(email, password) {
     
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
       if (data.session) {
  setSession(data.session);
} 
        return { error: error?.message ?? null };
      
      },
      async signUp(email, password, meta) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: meta, emailRedirectTo: `${window.location.origin}/auth` },
        });
        return { error: error?.message ?? null, needsConfirmation: !error && !data.session };
      },
      signInWithProvider,
      async signInWithGoogle() {
        return signInWithProvider("google");
      },
      async signOut() {
        await supabase.auth.signOut();
        setProfile(null);
      },
    }),
    [ready, session, profile, loadProfile, signInWithProvider],
  );

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth muss innerhalb von <AuthProvider> verwendet werden.");
  return ctx;
}
