import { Link } from "@tanstack/react-router";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="BauMatch Startseite">
      <span className="relative grid size-9 place-items-center overflow-hidden rounded-md bg-primary text-sm font-extrabold text-primary-foreground">
        B<span className="absolute bottom-0 h-1 w-full bg-brand-orange" />
      </span>
      <span className={`text-xl font-extrabold ${inverse ? "text-primary-foreground" : "text-foreground"}`}>BauMatch</span>
    </Link>
  );
}