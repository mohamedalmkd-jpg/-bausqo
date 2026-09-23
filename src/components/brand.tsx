import { Link } from "@tanstack/react-router";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="BAUSQO Startseite">
      <span className="relative grid size-10 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-cyan-300 text-base font-black text-brand-dark shadow-lg shadow-primary/15">
        B
        <span className="absolute inset-x-2 bottom-1.5 h-0.5 rounded-full bg-brand-dark/70" />
      </span>
      <span className="leading-none">
        <span className={`block text-xl font-black tracking-[0.03em] ${inverse ? "text-white" : "text-foreground"}`}>BAUSQO</span>
        <span className={`mt-1 hidden text-[8px] font-black uppercase tracking-[0.18em] sm:block ${inverse ? "text-white/30" : "text-muted-foreground"}`}>Bau · Match · Business</span>
      </span>
    </Link>
  );
}
