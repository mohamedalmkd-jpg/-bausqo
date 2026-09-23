import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Home, MessageSquare, Plus, Search, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth";

const tabs = [
  { label: "Start", to: "/", icon: Home, color: "#49e58b", tone: 329.63 },
  { label: "Suche", to: "/marketplace", icon: Search, color: "#8b7cff", tone: 440 },
  { label: "Neu", to: "/auftrag/erstellen", icon: Plus, color: "#f6c85f", tone: 523.25 },
  { label: "Chat", to: "/nachrichten", icon: MessageSquare, color: "#4fc8ff", tone: 587.33 },
  { label: "Profil", to: "/profil", icon: UserRound, color: "#ff6fae", tone: 659.25 },
] as const;

function routeIndex(pathname: string, redirect?: string) {
  if (
    (pathname === "/auth" || pathname === "/login" || pathname === "/registrieren") &&
    redirect?.startsWith("/auftrag/erstellen")
  ) return 2;

  const exact = tabs.findIndex((tab) => pathname === tab.to || pathname.startsWith(tab.to + "/"));
  if (exact >= 0) return exact;

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/matches") ||
    pathname.startsWith("/bewerbungen") ||
    pathname.startsWith("/gespeichert") ||
    pathname.startsWith("/benachrichtigungen") ||
    pathname.startsWith("/mitgliedschaft")
  ) return 0;

  return 0;
}

export function MobileLiquidNav() {
  const location = useRouterState({ select: (state) => state.location });
  const pathname = location.pathname;
  const redirect =
    typeof (location.search as Record<string, unknown> | undefined)?.redirect === "string"
      ? String((location.search as Record<string, unknown>).redirect)
      : undefined;
  const navigate = useNavigate();
  const { user, ready } = useAuth();
  const routeActiveIndex = useMemo(() => routeIndex(pathname, redirect), [pathname, redirect]);
  const [activeIndex, setActiveIndex] = useState(routeActiveIndex);
  const [fromIndex, setFromIndex] = useState(routeActiveIndex);
  const audioRef = useRef<AudioContext | null>(null);
  const pendingIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (pendingIndexRef.current !== null && routeActiveIndex === pendingIndexRef.current) {
      pendingIndexRef.current = null;
    }

    if (pendingIndexRef.current === null && activeIndex !== routeActiveIndex) {
      setFromIndex(activeIndex);
      setActiveIndex(routeActiveIndex);
    }
  }, [routeActiveIndex, activeIndex]);

  const activeTab = tabs[activeIndex];
  const distance = Math.abs(activeIndex - fromIndex);

  const navStyle = {
    "--nav-accent": activeTab.color,
    "--nav-from-x": `${fromIndex * 100}%`,
    "--nav-to-x": `${activeIndex * 100}%`,
    "--nav-stretch": String(1 + Math.min(distance, 4) * 0.36),
    "--nav-origin": activeIndex >= fromIndex ? "left center" : "right center",
  } as CSSProperties;

  function playNavigationTone(frequency: number) {
    if (typeof window === "undefined") return;

    try {
      const AudioContextCtor =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextCtor) return;

      const ctx = audioRef.current ?? new AudioContextCtor();
      audioRef.current = ctx;
      if (ctx.state === "suspended") void ctx.resume();

      const now = ctx.currentTime;
      const gain = ctx.createGain();
      const oscillator = ctx.createOscillator();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency * 0.94, now);
      oscillator.frequency.exponentialRampToValueAtTime(frequency, now + 0.045);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.06, now + 0.13);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.022, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.008, now + 0.07);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.16);

      if ("vibrate" in navigator) navigator.vibrate(5);
    } catch {
      // Sound is enhancement-only.
    }
  }

  function go(to: (typeof tabs)[number]["to"], tone: number, index: number) {
    playNavigationTone(tone);

    if (index === activeIndex && pathname === to) return;

    setFromIndex(activeIndex);
    setActiveIndex(index);
    pendingIndexRef.current = index;

    if (to === "/auftrag/erstellen") {
      if (ready && !user) {
        void navigate({
          to: "/auth",
          search: { redirect: "/auftrag/erstellen", mode: "signin" },
        });
        return;
      }

      void navigate({ to, search: { draft: undefined } });
      return;
    }

    void navigate({ to });
  }

  return (
    <nav className="bausqo-liquid-nav lg:hidden" style={navStyle} aria-label="Mobile Hauptnavigation">
      <span key={`${fromIndex}-${activeIndex}`} className="bausqo-liquid-light" aria-hidden="true">
        <span className="bausqo-liquid-light-core" />
      </span>

      <div className="bausqo-liquid-nav-grid">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const active = index === activeIndex;

          return (
            <button
              key={tab.to}
              type="button"
              onClick={() => go(tab.to, tab.tone, index)}
              className={`bausqo-liquid-tab ${active ? "is-active" : ""}`}
              style={{ "--tab-accent": tab.color } as CSSProperties}
              aria-current={active ? "page" : undefined}
              aria-label={tab.label}
            >
              <span className="bausqo-liquid-icon">
                <Icon className="size-[19px]" strokeWidth={active ? 2.4 : 1.85} />
              </span>
              <span className="bausqo-liquid-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
