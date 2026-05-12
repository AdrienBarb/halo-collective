import { Suspense } from "react";
import type { Metadata } from "next";
import ResetPasswordClient from "@/app/reset-password/ResetPasswordClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset your password — Halo Collective",
};

export default function ResetPasswordPage() {
  return (
    <div className="bg-cream">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-lg flex-col justify-center px-6 py-12">
        <div className="overflow-hidden rounded-2xl border border-line bg-cream-2">
          <div className="bg-ink px-6 py-6 text-center md:px-10 md:py-8">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-gold">
              Password reset
            </div>
            <h1 className="mt-2 font-serif text-[28px] font-semibold leading-tight tracking-[-0.015em] text-cream md:text-[32px]">
              Choose a new password
            </h1>
          </div>

          <div className="px-6 py-8 md:px-10 md:py-10">
            <Suspense
              fallback={
                <p className="text-[14px] text-ink-3">Loading…</p>
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
