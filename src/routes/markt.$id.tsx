import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { DetailNotFound } from "@/components/market-detail";
import { getMarketItem, itemLink } from "@/lib/market-utils";

/** Alte URL-Struktur – leitet dauerhaft auf die kanonische Detail-URL um. */
export const Route = createFileRoute("/markt/$id")({
  loader: ({ params }) => {
    const item = getMarketItem(Number(params.id));
    if (!item) throw notFound();
    const link = itemLink(item);
    throw redirect({ to: link.to, params: link.params });
  },
  notFoundComponent: DetailNotFound,
  component: () => null,
});
