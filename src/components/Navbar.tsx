import { headers } from "next/headers";
import Wordmark from "@/components/Wordmark";
import AccountMenu from "@/components/AccountMenu";
import NavbarAuthButton from "@/components/NavbarAuthButton";
import { getCurrentUser } from "@/lib/services/currentUser";
import { getCountryFromHeaders } from "@/lib/utils/getCountryFromHeaders";

export default async function Navbar() {
  const user = await getCurrentUser();
  const ipCountryCode = user ? null : getCountryFromHeaders(await headers());

  return (
    <header
      className="frost-nav sticky top-0 z-50 flex items-center justify-center border-b border-line px-8 py-[18px]"
      data-screen-label="Landing"
    >
      <Wordmark size="large" href="/" />
      <div className="absolute right-6 top-1/2 -translate-y-1/2">
        {user ? (
          <AccountMenu
            email={user.email}
            firstName={user.firstName}
            lastName={user.lastName}
            role={user.role}
          />
        ) : (
          <NavbarAuthButton ipCountryCode={ipCountryCode} />
        )}
      </div>
    </header>
  );
}
