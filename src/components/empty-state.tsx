import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ icon: Icon, title, text, actionLabel }: { icon: LucideIcon; title: string; text: string; actionLabel?: string }) {
  return (
    <div className="rounded-lg border border-dashed bg-card p-12 text-center">
      <Icon className="mx-auto size-8 text-muted-foreground" />
      <h2 className="mt-4 font-extrabold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{text}</p>
      {actionLabel && <Button asChild className="mt-6"><Link to="/marketplace">{actionLabel}</Link></Button>}
    </div>
  );
}
