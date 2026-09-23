import { useEffect, useState } from "react";
import { Link2, Mail, MessageSquare, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { MarketItem } from "@/lib/demo-data";
import { itemHref } from "@/lib/market-utils";

export function shareTextFor(item: MarketItem) {
  const title = `BauMatch: ${item.title}`;
  const text = [
    item.description,
    `${item.category} · ${item.location}`,
    item.kind === "Mitarbeiter" || item.kind === "Unternehmen" ? "" : `${item.match} % Übereinstimmung`,
    "Jetzt auf BauMatch ansehen",
  ]
    .filter(Boolean)
    .join("\n");
  return { title, text };
}

/**
 * Teilen-Dialog für eine konkrete, öffentlich erreichbare Adresse.
 * `path` ist immer der echte Pfad des Eintrags, z. B. /auftrag/<uuid>.
 */
export function ShareLinkButton({
  title,
  text,
  path,
  className,
  label = "Teilen",
  variant = "ghost",
}: {
  title: string;
  text: string;
  path: string;
  className?: string | undefined;
  label?: string | undefined;
  variant?: "ghost" | "outline" | "secondary" | "default" | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setUrl(window.location.origin + path);
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, [path]);

  const full = `${text}\n${url}`;

  async function nativeShare() {
    try {
      await navigator.share({ title, text, url });
      setOpen(false);
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") {
        toast.error("Das Teilen wurde vom Gerät abgebrochen. Nutzen Sie bitte eine Option unten.");
      }
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link kopiert.");
    } catch {
      toast.error("Kopieren wird von diesem Browser nicht unterstützt.");
    }
  }

  const targets = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(full)}` },
    { label: "Telegram", href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
  ];

  return (
    <>
      <Button
        type="button"
        variant={variant}
        className={className}
        onClick={() => {
          if (canNativeShare) void nativeShare();
          else setOpen(true);
        }}
      >
        <Share2 /> {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>„{title}“ teilen</DialogTitle>
            <DialogDescription>
              {canNativeShare
                ? "Das Gerät zeigt alle installierten Apps an. Alternativ können Sie unten direkt wählen."
                : "Dieses Gerät bietet keine System-Freigabe an. Nutzen Sie eine der folgenden Optionen."}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border bg-muted/40 p-4 text-sm leading-6">
            <p className="font-bold">{title}</p>
            <p className="mt-1 whitespace-pre-line text-muted-foreground">{text}</p>
            <p className="mt-2 break-all text-xs text-muted-foreground">{url}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {canNativeShare && (
              <Button className="sm:col-span-2" onClick={() => void nativeShare()}>
                <Share2 /> Weitere Apps (System-Freigabe)
              </Button>
            )}
            {targets.map((t) => (
              <Button key={t.label} variant="outline" asChild>
                <a href={t.href} target="_blank" rel="noopener noreferrer">{t.label}</a>
              </Button>
            ))}
            <Button variant="outline" asChild>
              <a href={`sms:?&body=${encodeURIComponent(full)}`}><MessageSquare /> SMS / Nachrichten</a>
            </Button>
            <Button variant="outline" asChild>
              <a href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(full)}`}><Mail /> E-Mail</a>
            </Button>
            <Button variant="secondary" className="sm:col-span-2" onClick={() => void copyLink()}>
              <Link2 /> Link kopieren
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Instagram und einige weitere Apps erlauben kein direktes Teilen aus dem Browser. Dort funktioniert nur die
            System-Freigabe des Geräts oder „Link kopieren“.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ShareButton({ item, className }: { item: MarketItem; className?: string }) {
  const { title, text } = shareTextFor(item);
  return <ShareLinkButton title={title} text={text} path={itemHref(item)} className={className} />;
}
