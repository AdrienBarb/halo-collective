import Link from "next/link";
import { listAllForAdmin } from "@/lib/services/athlete";
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

export default async function AdminAthletesPage() {
  const athletes = await listAllForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-[28px] font-semibold tracking-[-0.01em] text-ink">
          Athletes
        </h1>
        <Button asChild>
          <Link href="/admin/athletes/new">New athlete</Link>
        </Button>
      </div>

      {athletes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-cream-2 px-6 py-14 text-center">
          <p className="font-serif text-[20px] text-ink">No athletes yet.</p>
          <p className="mt-1 text-[13px] text-ink-3">
            Create your first one to get started.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-line bg-cream-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>World rank</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {athletes.map((athlete) => (
                <TableRow key={athlete.id}>
                  <TableCell className="font-medium">
                    {athlete.firstName} {athlete.lastName}
                  </TableCell>
                  <TableCell className="font-mono text-[12px] text-ink-2">
                    {athlete.slug}
                  </TableCell>
                  <TableCell>{athlete.countryName}</TableCell>
                  <TableCell>
                    {athlete.worldRank !== null ? `#${athlete.worldRank}` : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/${athlete.slug}`} target="_blank">
                          View ↗
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/athletes/${athlete.id}`}>Edit</Link>
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
