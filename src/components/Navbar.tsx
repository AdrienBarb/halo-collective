import { headers } from "next/headers";
import Wordmark from "@/components/Wordmark";
import AccountMenu from "@/components/AccountMenu";
import NavbarAuthButton from "@/components/NavbarAuthButton";
import { getCurrentUser } from "@/lib/services/currentUser";
import { getCountryFromHeaders } from "@/lib/utils/getCountryFromHeaders";
import { isLandingHidden } from "@/lib/utils/isLandingHidden";

export default async function Navbar() {
  const user = await getCurrentUser();
  const ipCountryCode = user ? null : getCountryFromHeaders(await headers());

  return (
    <header
      className="frost-nav sticky top-0 z-50 flex items-center justify-between border-b border-line px-4 py-[18px] md:justify-center md:px-8"
      data-screen-label="Landing"
    >
      <Wordmark size="large" href={isLandingHidden() ? null : "/"} />
      <div className="md:absolute md:right-6 md:top-1/2 md:-translate-y-1/2">
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
