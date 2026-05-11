import { headers } from "next/headers";
import Wordmark from "@/components/Wordmark";
import AccountMenu from "@/components/AccountMenu";
import { auth } from "@/lib/better-auth/auth";
import { prisma } from "@/lib/db/prisma";

export default async function Navbar() {
  const session = await auth.api.getSession({ headers: await headers() });

  let user: { email: string; firstName: string | null; lastName: string | null } | null =
    null;
  if (session?.user) {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, firstName: true, lastName: true },
    });
  }

  return (
    <header
      className="frost-nav sticky top-0 z-50 flex items-center justify-center border-b border-line px-8 py-[18px]"
      data-screen-label="Landing"
    >
      <Wordmark size="large" />
      {user ? (
        <div className="absolute right-6 top-1/2 -translate-y-1/2">
          <AccountMenu
            email={user.email}
            firstName={user.firstName}
            lastName={user.lastName}
          />
        </div>
      ) : null}
    </header>
  );
}
