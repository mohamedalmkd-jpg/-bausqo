import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Bookmark,
  Building2,
  CalendarClock,
  Clock3,
  MapPin,
  MessageSquare,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { MarketItem } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/lib/workspace-state";
import { itemLink, mapLabel } from "@/lib/market-utils";
import { isExternal, sourceNotice } from "@/lib/data-sources";

export function MatchBadge({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-black text-teal-700">
      {score}% Match
    </span>
  );
}

export function SaveButton({ item, className }: { item: MarketItem; className?: string }) {
  const { isSaved, toggleSaved, hydrated } = useWorkspace();
  const saved = hydrated && isSaved(item.id);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`rounded-full border bg-white/85 text-slate-500 shadow-sm hover:bg-white hover:text-teal-700 ${className ?? ""}`}
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
  const memberPlan = item.id % 3 === 0 ? "BUSINESS" : item.id % 3 === 1 ? "PRO" : "FREE";
  const memberClass =
    memberPlan === "BUSINESS"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : memberPlan === "PRO"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <article
      id={`card-${item.id}`}
      onClick={() => onSelect?.(item.id)}
      className={`group relative overflow-hidden rounded-[1.7rem] border bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,.11)] sm:p-7 ${selected ? "border-teal-400 ring-4 ring-teal-100" : ""}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-300 via-sky-400 to-teal-300 opacity-90" />
      <div className="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full bg-teal-100/60 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-lg bg-teal-50 px-2.5 py-1 font-black text-teal-700">Neu</span>
            <span className="text-muted-foreground">Vor kurzem</span>
            <span className="rounded-lg border bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500">Demo</span>
          </div>
          <SaveButton item={item} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-sm font-black text-slate-800">Auftragsklasse</span>
          <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700">
            <span className="size-2 rounded-full bg-emerald-600" />
            FREE
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Bis {item.budget} · Zugang ab FREE</p>

        <h3 className="mt-6 max-w-3xl text-2xl font-black leading-tight tracking-[-0.035em] text-slate-900 sm:text-3xl">
          <Link to={link.to} params={link.params} className="transition-colors hover:text-teal-700">
            {item.title}
          </Link>
        </h3>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="size-4 text-teal-700" />
            {item.provider}
          </span>
          <span className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-black ${memberClass}`}>
            <span className="size-2 rotate-45 bg-current opacity-85" />
            Mitglied · {memberPlan}
          </span>
          {isExternal(item.source) && (
            <span className="rounded-xl border bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500">Externe Quelle</span>
          )}
        </div>

        <Button
          asChild
          variant="outline"
          className="mt-6 h-14 w-full rounded-2xl border-teal-200 bg-teal-50/80 text-base font-black text-teal-800 hover:border-teal-300 hover:bg-teal-100"
        >
          <Link to="/nachrichten">
            <MessageSquare className="size-5" />
            Nachricht an Auftraggeber
            <ArrowUpRight className="ml-auto size-5" />
          </Link>
        </Button>

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><MapPin className="size-4" />{mapLabel(item)}</span>
          <span className="flex items-center gap-1.5"><CalendarClock className="size-4" />{item.start}</span>
          <span className="flex items-center gap-1.5"><Clock3 className="size-4" />{item.duration}</span>
          <span className="flex items-center gap-1.5"><Users className="size-4" />{item.people}</span>
        </div>

        <div className="mt-7 border-t pt-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.04em] text-slate-400">Auftragsvolumen</p>
              <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">{item.budget}</p>
            </div>

            <Link to={link.to} params={link.params} className="rounded-xl transition-transform hover:scale-[1.02]">
              <MatchBadge score={item.match} />
            </Link>
          </div>
        </div>

        <p className="mt-5 text-[11px] leading-5 text-muted-foreground/75">{sourceNotice(item.source)}</p>
      </div>
    </article>
  );
}
