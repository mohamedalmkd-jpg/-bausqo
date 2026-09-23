import { Link } from "@tanstack/react-router";
import { Layers3 } from "lucide-react";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="BAUSQO Startseite">
      <span className="relative grid size-10 place-items-center overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-[0_10px_30px_-12px_var(--primary)] transition-transform duration-300 group-hover:-translate-y-0.5">
        <Layers3 className="size-5" strokeWidth={2.4} />
        <span className="absolute inset-x-2 bottom-1 h-0.5 rounded-full bg-brand-orange" />
      </span>
      <span className={`text-xl font-black tracking-[-0.04em] ${inverse ? "text-primary-foreground" : "text-foreground"}`}>
        BAU<span className="text-primary">SQO</span>
      </span>
    </Link>
  );
}
