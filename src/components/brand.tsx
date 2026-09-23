import { Link } from "@tanstack/react-router";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="BAUSQO Startseite">
      <span className="relative grid size-9 place-items-center overflow-hidden rounded-xl bg-primary text-sm font-black text-primary-foreground shadow-lg shadow-primary/20">
        B
        <span className="absolute inset-x-1.5 bottom-1 h-0.5 rounded-full bg-primary-foreground/80" />
      </span>
      <span className={`text-xl font-black tracking-[0.04em] ${inverse ? "text-primary-foreground" : "text-foreground"}`}>
        BAUSQO
      </span>
    </Link>
  );
}
