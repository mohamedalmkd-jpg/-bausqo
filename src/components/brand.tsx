import { Link, useRouterState } from "@tanstack/react-router";
import type { CSSProperties } from "react";

function navigationAccent(pathname: string, redirect?: string) {
  if (
    (pathname === "/auth" || pathname === "/login" || pathname === "/registrieren") &&
    redirect?.startsWith("/auftrag/erstellen")
  ) return "#f6c85f";

  if (pathname === "/marketplace" || pathname.startsWith("/marketplace/")) return "#8b7cff";
  if (pathname === "/auftrag/erstellen" || pathname.startsWith("/auftrag/erstellen/")) return "#f6c85f";
  if (pathname === "/nachrichten" || pathname.startsWith("/nachrichten/")) return "#4fc8ff";
  if (pathname === "/profil" || pathname.startsWith("/profil/")) return "#ff6fae";

  return "#49e58b";
}

export function Brand({ inverse = false }: { inverse?: boolean }) {
  const location = useRouterState({ select: (state) => state.location });
  const redirect =
    typeof (location.search as Record<string, unknown> | undefined)?.redirect === "string"
      ? String((location.search as Record<string, unknown>).redirect)
      : undefined;
  const accent = navigationAccent(location.pathname, redirect);
  const brandStyle = { "--brand-accent": accent } as CSSProperties;

  return (
    <Link
      to="/"
      className="bausqo-brand group flex items-center gap-3"
      style={brandStyle}
      aria-label="BAUSQO Startseite"
    >
      <span className="bausqo-brand-mark relative grid size-10 place-items-center overflow-hidden rounded-xl text-base font-black text-brand-dark">
        B
        <span className="bausqo-brand-underline absolute inset-x-2 bottom-1.5 h-0.5 rounded-full bg-brand-dark/70" />
      </span>
      <span className="leading-none">
        <span className={`block text-xl font-black tracking-[0.03em] ${inverse ? "text-white" : "text-foreground"}`}>BAUSQO</span>
        <span className={`mt-1 hidden text-[8px] font-black uppercase tracking-[0.18em] sm:block ${inverse ? "text-white/30" : "text-muted-foreground"}`}>Bau · Match · Business</span>
      </span>
    </Link>
  );
}
