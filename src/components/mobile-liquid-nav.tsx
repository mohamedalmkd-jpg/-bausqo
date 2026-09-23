import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Home, MessageSquare, Plus, Search, UserRound } from "lucide-react";

const tabs = [
  { label: "Start", to: "/", icon: Home, color: "#49e58b", tone: 329.63 },
  { label: "Suche", to: "/marketplace", icon: Search, color: "#8b7cff", tone: 440 },
  { label: "Neu", to: "/auftrag/erstellen", icon: Plus, color: "#f6c85f", tone: 523.25 },
  { label: "Chat", to: "/nachrichten", icon: MessageSquare, color: "#4fc8ff", tone: 587.33 },
  { label: "Profil", to: "/profil", icon: UserRound, color: "#ff6fae", tone: 659.25 },
] as const;

function routeIndex(pathname: string) {
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
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const currentIndex = useMemo(() => routeIndex(pathname), [pathname]);
  const [fromIndex, setFromIndex] = useState(currentIndex);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      const stored = Number(window.sessionStorage.getItem("bausqo-mobile-tab"));
      const safeStored = Number.isInteger(stored) && stored >= 0 && stored < tabs.length ? stored : currentIndex;
      setFromIndex(safeStored);
      window.sessionStorage.setItem("bausqo-mobile-tab", String(currentIndex));
    } catch {
      setFromIndex(currentIndex);
    }
  }, [currentIndex]);

  const activeTab = tabs[currentIndex];
  const distance = Math.abs(currentIndex - fromIndex);

  const navStyle = {
    "--nav-accent": activeTab.color,
    "--nav-from-x": `${fromIndex * 100}%`,
    "--nav-to-x": `${currentIndex * 100}%`,
    "--nav-stretch": String(1 + Math.min(distance, 4) * 0.48),
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
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.045, now + 0.09);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.026, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.13);

      if ("vibrate" in navigator) navigator.vibrate(6);
    } catch {
      // Sound is enhancement-only.
    }
  }

  function go(to: (typeof tabs)[number]["to"], tone: number, index: number) {
    playNavigationTone(tone);
    setFromIndex(currentIndex);

    try {
      window.sessionStorage.setItem("bausqo-mobile-tab", String(currentIndex));
    } catch {
      // sessionStorage can be disabled; the visual still works.
    }

    if (index === currentIndex && pathname === to) return;

    if (to === "/auftrag/erstellen") {
      void navigate({ to, search: { draft: undefined } });
      return;
    }

    void navigate({ to });
  }

  return (
    <nav className="bausqo-liquid-nav lg:hidden" style={navStyle} aria-label="Mobile Hauptnavigation">
      <span key={`${fromIndex}-${currentIndex}-${pathname}`} className="bausqo-liquid-light" aria-hidden="true">
        <span className="bausqo-liquid-light-core" />
      </span>

      <div className="bausqo-liquid-nav-grid">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const active = index === currentIndex;

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
