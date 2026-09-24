import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
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
  const router = useRouter();
  const { user, ready } = useAuth();
  const routeActiveIndex = useMemo(() => routeIndex(pathname, redirect), [pathname, redirect]);
  const [activeIndex, setActiveIndex] = useState(routeActiveIndex);
  const [fromIndex, setFromIndex] = useState(routeActiveIndex);
  const audioRef = useRef<AudioContext | null>(null);
  const pendingIndexRef = useRef<number | null>(null);

  // Search is the most common next destination from Home, so warm it first.
  // The remaining tabs are prepared after the browser gets a quiet moment.
  useEffect(() => {
    void router.preloadRoute({ to: "/marketplace" });

    const preloadRest = () => {
      void Promise.allSettled([
        router.preloadRoute({ to: "/" }),
        router.preloadRoute({ to: "/nachrichten" }),
        router.preloadRoute({ to: "/profil" }),
      ]);
    };

    const browser = window as typeof window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (browser.requestIdleCallback) {
      const id = browser.requestIdleCallback(preloadRest, { timeout: 700 });
      return () => browser.cancelIdleCallback?.(id);
    }

    const id = window.setTimeout(preloadRest, 220);
    return () => window.clearTimeout(id);
  }, [router]);

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

    // On phones/tablets, avoid creating an AudioContext during navigation.
    // A tiny haptic response is much cheaper and feels more immediate.
    if (window.matchMedia("(pointer: coarse)").matches) {
      if ("vibrate" in navigator) navigator.vibrate(4);
      return;
    }

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
    if (index === activeIndex && pathname === to) return;

    pendingIndexRef.current = index;

    const syncNavVisual = () => {
      window.requestAnimationFrame(() => {
        setFromIndex(activeIndex);
        setActiveIndex(index);
      });
    };

    const playFeedback = () => {
      window.setTimeout(() => playNavigationTone(tone), 70);
    };

    if (to === "/auftrag/erstellen") {
      if (ready && !user) {
        void navigate({
          to: "/auth",
          search: { redirect: "/auftrag/erstellen", mode: "signin" },
        });
        syncNavVisual();
        playFeedback();
        return;
      }

      void navigate({ to, search: { draft: undefined } });
      syncNavVisual();
      playFeedback();
      return;
    }

    // Start the route change before any cosmetic state work.
    void navigate({ to });
    syncNavVisual();
    playFeedback();
  }

  return (
    <nav className="bausqo-liquid-nav lg:hidden" style={navStyle} aria-label="Mobile Hauptnavigation">
      <span key={`${fromIndex}-${activeIndex}`} className="bausqo-liquid-light" aria-hidden="true">
        <span className="bausqo-liquid-wind bausqo-liquid-wind-1" />
        <span className="bausqo-liquid-wind bausqo-liquid-wind-2" />
        <span className="bausqo-liquid-wind bausqo-liquid-wind-3" />
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
                <Icon className="size-[22px]" strokeWidth={active ? 2.35 : 1.9} />
              </span>
              <span className="bausqo-liquid-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
