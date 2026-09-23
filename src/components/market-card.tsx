import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  MapPin,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { MarketItem } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import { PlanBadge, type MembershipPlan } from "@/components/plan-badge";
import { useWorkspace } from "@/lib/workspace-state";
import { itemLink, mapLabel } from "@/lib/market-utils";
import { isExternal, sourceNotice } from "@/lib/data-sources";

export function MatchBadge({ score }: { score: number }) {
  const tone = score >= 90 ? "text-emerald-700 border-emerald-200 bg-emerald-50" : score >= 80 ? "text-primary border-primary/20 bg-primary/5" : "text-amber-700 border-amber-200 bg-amber-50";
  return (
    <div className={`shrink-0 rounded-2xl border px-3 py-2.5 text-center shadow-sm ${tone}`}>
      <span className="block text-lg font-black leading-none">{score}%</span>
      <span className="mt-1 block text-[8px] font-black uppercase tracking-[0.14em] opacity-70">Match</span>
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
      size="icon"
      className={`rounded-xl ${className ?? ""}`}
      aria-label={saved ? "Gespeichert" : "Speichern"}
      aria-pressed={saved}
      onClick={(event) => {
        event.stopPropagation();
        const next = toggleSaved(item);
        toast.success(next ? "Gespeichert – unter „Gespeichert“ zu finden." : "Aus den gespeicherten Einträgen entfernt.");
      }}
    >
      <Bookmark className={saved ? "fill-current" : ""} />
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
  const plan: MembershipPlan = item.id % 3 === 0 ? "BUSINESS" : item.id % 3 === 1 ? "PRO" : "FREE";

  return (
    <article
      id={`card-${item.id}`}
      onClick={() => onSelect?.(item.id)}
      className={`group bausqo-panel bausqo-lift relative overflow-hidden rounded-[1.55rem] p-5 sm:p-6 ${selected ? "border-primary ring-4 ring-primary/10" : ""}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-cyan-300 to-sky-400" />
      <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-primary/7 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.09em] text-primary">{item.category}</span>
            <span className="rounded-lg border bg-muted/50 px-2.5 py-1 text-[10px] font-bold text-muted-foreground">Neu</span>
            {isExternal(item.source) && <span className="rounded-lg border bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">Extern</span>}
          </div>

          <h3 className="max-w-2xl text-xl font-black leading-tight tracking-[-0.025em] text-card-foreground sm:text-[1.35rem]">
            <Link to={link.to} params={link.params} className="transition-colors hover:text-primary">{item.title}</Link>
          </h3>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Building2 className="size-4 text-primary" />
              {item.provider}
            </span>
            <PlanBadge plan={plan} />
          </div>
        </div>

        <div className="flex items-start gap-2">
          <SaveButton item={item} className="border bg-background/80 shadow-sm" />
          <MatchBadge score={item.match} />
        </div>
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
            <div key={String(value)} className="rounded-xl border bg-muted/28 px-3 py-2.5">
              <MetaIcon className="size-4 text-primary" />
              <span className="mt-1.5 block truncate text-xs font-bold text-foreground/75">{String(value)}</span>
            </div>
          );
        })}
      </div>

      <p className="mt-5 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.description}</p>

      <div className="mt-5 flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">Auftragsvolumen</p>
          <p className="mt-1 text-2xl font-black tracking-[-0.03em]">{item.budget}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">{sourceNotice(item.source)}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/nachrichten">
              <MessageSquare className="size-4" />
              <span className="hidden sm:inline">Nachricht</span>
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

      <Sparkles className="pointer-events-none absolute bottom-5 right-5 size-4 text-primary/8" />
    </article>
  );
}
