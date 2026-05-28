import Link from "next/link";
import { format } from "date-fns";
import { listAllForAdmin } from "@/lib/services/newsletter";
import { Button } from "@/components/ui/button";
import NewsletterStatusPill from "@/components/admin/NewsletterStatusPill";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminNewslettersPage() {
  const newsletters = await listAllForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-sans text-[28px] font-semibold tracking-[-0.01em] text-ink">
          Newsletters
        </h1>
        <Button asChild>
          <Link href="/admin/newsletters/new">New newsletter</Link>
        </Button>
      </div>

      {newsletters.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-cream-2 px-6 py-14 text-center">
          <p className="text-[20px] text-ink">No newsletters yet.</p>
          <p className="mt-1 text-[13px] text-ink-3">
            Create your first one to get started.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-line bg-cream-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Athlete</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {newsletters.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-sans text-[12px]">
                    {n.editionNumber.toString().padStart(2, "0")}
                  </TableCell>
                  <TableCell className="font-medium">{n.title}</TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/athletes/${n.athlete.id}`}
                      className="text-ink-2 hover:text-ink"
                    >
                      {n.athlete.firstName} {n.athlete.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <NewsletterStatusPill status={n.status} />
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
                            href={`/${n.athlete.slug}/${n.slug}`}
                            target="_blank"
                          >
                            View ↗
                          </Link>
                        </Button>
                      ) : null}
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/newsletters/${n.id}`}>Edit</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
