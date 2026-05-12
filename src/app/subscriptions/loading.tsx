import { getTranslations } from "next-intl/server";

export default async function SubscriptionsLoading() {
  const t = await getTranslations("Subscriptions");
  return (
    <div className="mx-auto max-w-[1100px] space-y-6 px-5 py-10">
      <div>
        <h1 className="font-serif text-[28px] font-semibold tracking-[-0.01em] text-ink">
          {t("title")}
        </h1>
        <p className="mt-1 text-[13px] text-ink-3">{t("subhead")}</p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-line bg-cream-2"
          >
            <div className="aspect-square w-full animate-pulse bg-cream-3" />
            <div className="h-1 bg-line" />
            <div className="px-5 pb-5 pt-[18px]">
              <div className="h-5 w-2/3 animate-pulse rounded bg-cream-3" />
              <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-cream-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
