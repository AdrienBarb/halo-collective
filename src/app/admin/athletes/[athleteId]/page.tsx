import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getAthleteById } from "@/lib/services/athlete";
import { listAllByAthleteId } from "@/lib/services/newsletter";
import AthleteForm from "@/components/admin/AthleteForm";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function EditAthletePage({
  params,
}: {
  params: Promise<{ athleteId: string }>;
}) {
  const { athleteId } = await params;
  const [athlete, newsletters] = await Promise.all([
    getAthleteById(athleteId),
    listAllByAthleteId(athleteId),
  ]);
  if (!athlete) notFound();

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/admin/athletes"
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3 hover:text-ink"
        >
          ← Athletes
        </Link>
        <h1 className="mt-2 font-serif text-[28px] font-semibold tracking-[-0.01em] text-ink">
          {athlete.firstName} {athlete.lastName}
        </h1>
      </div>

      <section>
        <h2 className="mb-4 font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-ink">
          Profile
        </h2>
        <AthleteForm mode="edit" initialData={athlete} />
      </section>

      <hr className="border-t border-line" />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-ink">
            Newsletters
          </h2>
          <Button asChild>
            <Link href={`/admin/athletes/${athlete.id}/newsletters/new`}>
              New newsletter
            </Link>
          </Button>
        </div>

        {newsletters.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-cream-2 px-6 py-12 text-center">
            <p className="font-serif text-[18px] text-ink">No newsletters yet.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-line bg-cream-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newsletters.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-mono text-[12px]">
                      {n.editionNumber.toString().padStart(2, "0")}
                    </TableCell>
                    <TableCell className="font-medium">{n.title}</TableCell>
                    <TableCell className="font-mono text-[12px] text-ink-2">
                      {n.slug}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-pill border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${
                          n.status === "PUBLISHED"
                            ? "border-ok/30 bg-ok/10 text-ok"
                            : "border-line bg-cream-3 text-ink-3"
                        }`}
                      >
                        {n.status.toLowerCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-[13px] text-ink-3">
                      {n.publishedAt
                        ? format(n.publishedAt, "d MMM yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {n.status === "PUBLISHED" ? (
                          <Button asChild size="sm" variant="ghost">
                            <Link
                              href={`/${athlete.slug}/${n.slug}`}
                              target="_blank"
                            >
                              View ↗
                            </Link>
                          </Button>
                        ) : null}
                        <Button asChild size="sm" variant="outline">
                          <Link
                            href={`/admin/athletes/${athlete.id}/newsletters/${n.id}`}
                          >
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
