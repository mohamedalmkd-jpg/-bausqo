import { Link } from "@tanstack/react-router";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="BAUSQO Startseite">
      <span className="relative grid size-9 place-items-center overflow-hidden rounded-xl bg-primary text-sm font-black shadow-lg shadow-primary/15 text-primary-foreground">
        B<span className="absolute bottom-0 h-1 w-full bg-brand-orange" />
      </span>
      <span className={`text-xl font-extrabold ${inverse ? "text-primary-foreground" : "text-foreground"}`}>BAUSQO</span>
    </Link>
  );
}