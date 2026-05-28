import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ResetPasswordClient from "@/app/reset-password/ResetPasswordClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset your password — Halo Collective",
};

export default async function ResetPasswordPage() {
  const t = await getTranslations("Auth.ResetPassword");
  return (
    <div className="bg-cream">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-lg flex-col justify-center px-6 py-12">
        <div className="overflow-hidden rounded-2xl border border-line bg-cream-2">
          <div className="bg-ink px-6 py-6 text-center md:px-10 md:py-8">
            <div className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-accent-gold">
              {t("eyebrow")}
            </div>
            <h1 className="mt-2 font-display text-[28px] font-semibold leading-tight tracking-[-0.015em] text-cream md:text-[32px]">
              {t("title")}
            </h1>
          </div>

          <div className="px-6 py-8 md:px-10 md:py-10">
            <Suspense
              fallback={
                <p className="text-[14px] text-ink-3">{t("loading")}</p>
              }
            >
              <ResetPasswordClient />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
