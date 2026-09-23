import { createFileRoute, notFound } from "@tanstack/react-router";
import { DetailNotFound, MarketDetail, detailMeta } from "@/components/market-detail";
import { getMarketItem } from "@/lib/market-utils";

export const Route = createFileRoute("/teams/$id")({
  loader: ({ params }) => {
    const item = getMarketItem(Number(params.id));
    if (!item || item.kind !== "Mitarbeiter" || item.profileType !== "team") throw notFound();
    return { item };
  },
  head: ({ loaderData }) => detailMeta(loaderData?.item),
  notFoundComponent: DetailNotFound,
  component: TeamDetailRoute,
});

function TeamDetailRoute() {
  const { item } = Route.useLoaderData();
  return <MarketDetail item={item} />;
}
