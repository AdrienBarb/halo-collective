"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function SubscriptionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Subscriptions.Error");

  useEffect(() => {
    console.error(
      JSON.stringify({
        scope: "subscription.list.error",
        digest: error.digest,
        message: error.message,
      }),
    );
  }, [error]);

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 px-5 py-10">
      <div>
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.01em] text-ink">
          {t("title")}
        </h1>
      </div>
      <div className="rounded-2xl border border-dashed border-line bg-cream-2 px-6 py-14 text-center">
        <p className="font-display text-[20px] text-ink">{t("errorTitle")}</p>
        <p className="mt-1 text-[13px] text-ink-3">{t("errorBody")}</p>
        <Button onClick={reset} className="mt-5">
          {t("tryAgain")}
        </Button>
      </div>
    </div>
  );
}
