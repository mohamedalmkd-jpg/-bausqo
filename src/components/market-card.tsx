import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  MapPin,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { MarketItem } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/lib/workspace-state";
import { itemLink, mapLabel } from "@/lib/market-utils";
import { isExternal, sourceNotice } from "@/lib/data-sources";

export function MatchBadge({ score }: { score: number }) {
  const tone = score >= 90 ? "text-emerald-600" : score >= 80 ? "text-primary" : "text-amber-600";
  return (
    <div className="relative grid size-[72px] shrink-0 place-items-center rounded-full p-[4px]" style={{ background: `conic-gradient(var(--color-primary) 0deg ${score * 3.6}deg, color-mix(in oklab, var(--border) 75%, transparent) ${score * 3.6}deg 360deg)` }}>
      <div className="grid size-full place-items-center rounded-full bg-card text-center shadow-inner">
        <span className={`text-sm font-black ${tone}`}>
          {score}%
          <span className="block text-[8px] font-black uppercase tracking-[0.12em] text-muted-foreground">Match</span>
        </span>
      </div>
    </div>
  );
}

export function SaveButton({ item, className }: { item: MarketItem; className?: string }) {
  const { isSaved, toggleSaved, hydrated } = useWorkspace();
  const saved = hydrated && isSaved(item.id);

  return (
    <Button
      type="button"
      variant={saved ? "secondary" : "ghost"}
      size="sm"
      className={`rounded-xl ${className ?? ""}`}
      aria-pressed={saved}
      onClick={(event) => {
        event.stopPropagation();
        const next = toggleSaved(item);
        toast.success(next ? "Gespeichert – unter „Gespeichert“ zu finden." : "Aus den gespeicherten Einträgen entfernt.");
      }}
    >
      <Bookmark className={saved ? "fill-current" : ""} />
      <span className="hidden sm:inline">{saved ? "Gespeichert" : "Speichern"}</span>
    </Button>
  );
}

export function MarketCard({
  item,
  selected,
  onSelect,
}: {
  item: MarketItem;
  selected?: boolean;
  onSelect?: (id: number) => void;
}) {
  const link = itemLink(item);

  return (
    <article
      id={`card-${item.id}`}
      onClick={() => onSelect?.(item.id)}
      className={`group premium-panel interaction-lift relative overflow-hidden rounded-[1.35rem] p-5 sm:p-6 ${selected ? "border-primary ring-2 ring-primary/20" : ""}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-sky-400 to-cyan-300 opacity-80" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-primary">
              {item.category}
            </span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-amber-700">
              Demo
            </span>
            {isExternal(item.source) && (
              <span className="rounded-full border bg-muted/70 px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                Externe Quelle
              </span>
            )}
          </div>

          <h3 className="max-w-2xl text-lg font-black leading-snug tracking-tight text-card-foreground sm:text-xl">
            <Link to={link.to} params={link.params} className="transition-colors hover:text-primary">
              {item.title}
            </Link>
          </h3>
          <p className="mt-1.5 text-sm font-semibold text-muted-foreground">{item.provider}</p>
        </div>
        <MatchBadge score={item.match} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          [MapPin, mapLabel(item)],
          [CalendarDays, item.start],
          [BriefcaseBusiness, item.duration],
          [Users, item.people],
        ].map(([Icon, value]) => {
          const MetaIcon = Icon as typeof MapPin;
          return (
            <div key={String(value)} className="rounded-xl border bg-muted/35 px-3 py-2.5">
              <MetaIcon className="mb-1 size-4 text-primary" />
              <span className="block truncate text-xs font-semibold text-foreground/80">{String(value)}</span>
            </div>
          );
        })}
      </div>

      <p className="mt-5 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
      <p className="mt-2 text-[11px] text-muted-foreground/80">{sourceNotice(item.source)}</p>

      <div className="mt-5 flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">Budget</p>
          <p className="mt-1 text-xl font-black tracking-tight">{item.budget}</p>
        </div>

        <div className="flex items-center gap-2">
          <SaveButton item={item} />
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/nachrichten">
              <MessageSquare className="size-4" />
              <span className="hidden md:inline">Nachricht</span>
            </Link>
          </Button>
          <Button asChild className="rounded-xl">
            <Link to={link.to} params={link.params}>
              Details
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="pointer-events-none absolute -right-14 -top-14 size-32 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
      <Sparkles className="pointer-events-none absolute bottom-5 right-5 size-4 text-primary/10" />
    </article>
  );
}
