"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Shield } from "lucide-react";
import { UserRole } from "@prisma/client";
import { authClient } from "@/lib/better-auth/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AccountMenuProps {
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
}

function initials(firstName: string | null, lastName: string | null, email: string) {
  const f = firstName?.[0];
  const l = lastName?.[0];
  if (f && l) return `${f}${l}`.toUpperCase();
  if (f) return f.toUpperCase();
  return email[0]?.toUpperCase() ?? "?";
}

function formatDisplayName(
  firstName: string | null,
  lastName: string | null,
  email: string,
) {
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  return email;
}

export default function AccountMenu({
  email,
  firstName,
  lastName,
  role,
}: AccountMenuProps) {
  const router = useRouter();

  async function onSignOut() {
    await authClient.signOut();
    router.refresh();
  }

  const display = formatDisplayName(firstName, lastName, email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line bg-cream-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink transition hover:bg-cream-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
      >
        {initials(firstName, lastName, email)}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[220px] border-line bg-cream-2"
      >
        <DropdownMenuLabel>
          <div className="font-serif text-[14px] font-semibold text-ink">
            {display}
          </div>
          <div className="mt-0.5 text-[12px] text-ink-3">{email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {role === UserRole.ADMIN ? (
          <>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/admin">
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem
          onSelect={() => void onSignOut()}
          className="cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
