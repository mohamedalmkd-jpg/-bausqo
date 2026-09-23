import { Link } from "@tanstack/react-router";
import { ArrowRight, Bookmark, BriefcaseBusiness, CalendarDays, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import type { MarketItem } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/lib/workspace-state";
import { itemLink, mapLabel } from "@/lib/market-utils";
import { isExternal, sourceNotice } from "@/lib/data-sources";

export function MatchBadge({ score }: { score: number }) {
  return <div className="grid size-16 shrink-0 place-items-center rounded-full border-4 border-primary/15 bg-primary/5 text-center"><span className="text-sm font-extrabold text-primary">{score}%<span className="block text-[9px] font-semibold uppercase text-muted-foreground">Match</span></span></div>;
}

export function SaveButton({ item, className }: { item: MarketItem; className?: string }) {
  const { isSaved, toggleSaved, hydrated } = useWorkspace();
  const saved = hydrated && isSaved(item.id);
  return (
    <Button
      type="button"
      variant={saved ? "secondary" : "ghost"}
      size="sm"
      className={className}
      aria-pressed={saved}
      onClick={() => {
        const next = toggleSaved(item);
        toast.success(next ? "Gespeichert – unter „Gespeichert“ zu finden." : "Aus den gespeicherten Einträgen entfernt.");
      }}
    >
      <Bookmark className={saved ? "fill-current" : ""} /> {saved ? "Gespeichert" : "Speichern"}
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
  return <article
    id={`card-${item.id}`}
    onClick={() => onSelect?.(item.id)}
    className={`group rounded-lg border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg sm:p-6 ${selected ? "border-brand-orange ring-2 ring-brand-orange/30" : ""}`}
  >
    <div className="flex items-start justify-between gap-4">
      <div><div className="mb-3 flex flex-wrap items-center gap-2"><span className="rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{item.category}</span><span className="rounded bg-brand-orange/10 px-2 py-1 text-xs font-semibold text-brand-orange">Demo</span>{isExternal(item.source) && <span className="rounded bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">Externe Quelle</span>}</div>
        <h3 className="text-lg font-extrabold text-card-foreground"><Link to={link.to} params={link.params} className="hover:text-primary">{item.title}</Link></h3>
        <p className="mt-1 text-sm font-medium text-muted-foreground">{item.provider}</p></div>
      <MatchBadge score={item.match} />
    </div>
    <div className="my-5 grid grid-cols-2 gap-3 border-y py-4 text-sm text-muted-foreground sm:grid-cols-4">
      <span className="flex items-center gap-2"><MapPin className="size-4 text-primary" />{mapLabel(item)}</span>
      <span className="flex items-center gap-2"><CalendarDays className="size-4 text-primary" />{item.start}</span>
      <span className="flex items-center gap-2"><BriefcaseBusiness className="size-4 text-primary" />{item.duration}</span>
      <span className="flex items-center gap-2"><Users className="size-4 text-primary" />{item.people}</span>
    </div>
    <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
    <p className="mt-3 text-xs text-muted-foreground">{sourceNotice(item.source)}</p>
    <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase text-muted-foreground">Budget</p><p className="mt-1 font-extrabold">{item.budget}</p></div>
      <div className="flex items-center gap-2">
        <SaveButton item={item} />
        <Button asChild variant="outline"><Link to={link.to} params={link.params}>Details ansehen <ArrowRight /></Link></Button>
      </div>
    </div>
  </article>;
}
