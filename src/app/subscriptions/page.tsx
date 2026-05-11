import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/better-auth/auth";
import { listSubscriptionsByUser } from "@/lib/services/subscription";
import RosterCard from "@/components/RosterCard";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My subscriptions — Halo Collective",
  description: "The athletes whose newsletter you receive.",
};

export default async function SubscriptionsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/");

  const subscriptions = await listSubscriptionsByUser(session.user.id);

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 px-5 py-10">
      <div>
        <h1 className="font-serif text-[28px] font-semibold tracking-[-0.01em] text-ink">
          My subscriptions
        </h1>
        <p className="mt-1 text-[13px] text-ink-3">
          The athletes whose newsletter you receive.
        </p>
      </div>

      {subscriptions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-cream-2 px-6 py-14 text-center">
          <p className="font-serif text-[20px] text-ink">
            You&apos;re not following any athlete yet.
          </p>
          <p className="mt-1 text-[13px] text-ink-3">
            Discover the roster and subscribe to your first athlete.
          </p>
          <Button asChild className="mt-5">
            <Link href="/">See athletes</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((sub) => (
            <RosterCard key={sub.id} athlete={sub.athlete} />
          ))}
        </div>
      )}
    </div>
  );
}
