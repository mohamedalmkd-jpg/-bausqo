import { BadgeCheck, Building2, Crown } from "lucide-react";

export type MembershipPlan = "FREE" | "PRO" | "BUSINESS";

const planMeta = {
  FREE: {
    icon: BadgeCheck,
    className: "plan-badge plan-badge-free",
    label: "FREE",
  },
  PRO: {
    icon: Crown,
    className: "plan-badge plan-badge-pro",
    label: "PRO",
  },
  BUSINESS: {
    icon: Building2,
    className: "plan-badge plan-badge-business",
    label: "BUSINESS",
  },
} satisfies Record<MembershipPlan, {
  icon: typeof BadgeCheck;
  className: string;
  label: MembershipPlan;
}>;

export function PlanBadge({
  plan,
  compact = false,
  className = "",
}: {
  plan: MembershipPlan;
  compact?: boolean;
  className?: string;
}) {
  const meta = planMeta[plan];
  const Icon = meta.icon;

  return (
    <span
      className={[
        "inline-flex items-center font-black tracking-[0.08em]",
        compact ? "gap-1.5 rounded-full px-2.5 py-1 text-[9px]" : "gap-2 rounded-xl px-3 py-2 text-[10px]",
        meta.className,
        className,
      ].join(" ")}
      aria-label={"Mitgliedschaft " + meta.label}
    >
      <Icon className={compact ? "size-3" : "size-3.5"} />
      {meta.label}
    </span>
  );
}
