"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function SubscriptionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
    <div lang="fr" className="mx-auto max-w-[1100px] space-y-6 px-5 py-10">
      <div>
        <h1 className="font-serif text-[28px] font-semibold tracking-[-0.01em] text-ink">
          Mes abonnements
        </h1>
      </div>
      <div className="rounded-2xl border border-dashed border-line bg-cream-2 px-6 py-14 text-center">
        <p className="font-serif text-[20px] text-ink">
          Impossible de charger vos abonnements.
        </p>
        <p className="mt-1 text-[13px] text-ink-3">
          Une erreur est survenue. Réessayez dans un instant.
        </p>
        <Button onClick={reset} className="mt-5">
          Réessayer
        </Button>
      </div>
    </div>
  );
}
