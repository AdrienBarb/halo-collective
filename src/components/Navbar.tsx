import Wordmark from "@/components/Wordmark";
import AccountMenu from "@/components/AccountMenu";
import { getCurrentUser } from "@/lib/services/currentUser";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header
      className="frost-nav sticky top-0 z-50 flex items-center justify-center border-b border-line px-8 py-[18px]"
      data-screen-label="Landing"
    >
      <Wordmark size="large" href={null} />
      {user ? (
        <div className="absolute right-6 top-1/2 -translate-y-1/2">
          <AccountMenu
            email={user.email}
            firstName={user.firstName}
            lastName={user.lastName}
            role={user.role}
          />
        </div>
      ) : null}
    </header>
  );
}
