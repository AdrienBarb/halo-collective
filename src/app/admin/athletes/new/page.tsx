import Link from "next/link";
import AthleteForm from "@/components/admin/AthleteForm";

export const metadata = { title: "New athlete · Admin" };

export default function NewAthletePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/athletes"
          className="font-sans text-[11px] uppercase tracking-[0.18em] text-ink-3 hover:text-ink"
        >
          ← Athletes
        </Link>
        <h1 className="mt-2 font-sans text-[28px] font-semibold tracking-[-0.01em] text-ink">
          New athlete
        </h1>
      </div>
      <AthleteForm mode="create" />
    </div>
  );
}
