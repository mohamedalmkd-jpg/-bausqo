import { useState } from "react";
import { Loader2 } from "lucide-react";
import { oauthErrorMessage, useAuth } from "@/lib/auth";
import { toast } from "sonner";

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" className="size-[18px]" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.35 0-4.33-1.58-5.04-3.71H.93v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.96 10.71a5.41 5.41 0 0 1 0-3.42V4.96H.93a9 9 0 0 0 0 8.08l3.03-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .93 4.96l3.03 2.33C4.67 5.16 6.65 3.58 9 3.58Z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px] fill-current" aria-hidden="true">
      <path d="M16.36 12.78c.02 2.5 2.19 3.33 2.22 3.35-.02.06-.35 1.2-1.15 2.37-.69 1.02-1.41 2.03-2.55 2.05-1.11.02-1.47-.66-2.75-.66-1.27 0-1.67.64-2.73.68-1.09.04-1.92-1.1-2.62-2.11-1.43-2.07-2.52-5.85-1.05-8.4A4.07 4.07 0 0 1 9.17 7.9c1.07-.02 2.08.72 2.74.72.65 0 1.88-.89 3.17-.76.54.02 2.06.22 3.03 1.64-.08.05-1.81 1.06-1.79 3.16M14.3 5.9c.58-.71.98-1.7.87-2.69-.84.04-1.86.57-2.47 1.27-.54.63-1.01 1.63-.88 2.6.94.07 1.89-.47 2.47-1.18" />
    </svg>
  );
}

export function OAuthButtons({ mode, redirect }: { mode: "signin" | "signup"; redirect?: string }) {
  const { signInWithProvider } = useAuth();
  const [busy, setBusy] = useState<"google" | "apple" | null>(null);

  async function start(provider: "google" | "apple") {
    setBusy(provider);
    const { error } = await signInWithProvider(provider, redirect);
    if (error) toast.error(oauthErrorMessage(provider, error));
    setBusy(null);
  }

  const googleLabel = mode === "signup" ? "Weiter mit Google" : "Mit Google anmelden";
  const appleLabel = mode === "signup" ? "Weiter mit Apple" : "Mit Apple anmelden";

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => void start("google")}
        className="group relative flex h-13 w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white text-[15px] font-bold text-slate-800 shadow-[0_8px_24px_rgba(15,23,42,.07)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_32px_rgba(15,23,42,.11)] disabled:opacity-60"
      >
        <span className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#4285F4] via-[#34A853] to-[#EA4335]" />
        {busy === "google" ? <Loader2 className="size-[18px] animate-spin" /> : <GoogleMark />}
        {googleLabel}
      </button>
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => void start("apple")}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-foreground text-[15px] font-semibold text-background shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-95 disabled:opacity-60"
      >
        {busy === "apple" ? <Loader2 className="size-[18px] animate-spin" /> : <AppleMark />}
        {appleLabel}
      </button>
    </div>
  );
}
