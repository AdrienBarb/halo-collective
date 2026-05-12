"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

const AuthModal = dynamic(() => import("@/components/auth/AuthModal"), {
  ssr: false,
});

interface NavbarAuthButtonProps {
  ipCountryCode: string | null;
}

export default function NavbarAuthButton({
  ipCountryCode,
}: NavbarAuthButtonProps) {
  const router = useRouter();
  const t = useTranslations("Navbar");
  const [open, setOpen] = useState(false);

  function onSuccess() {
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-md border border-line bg-cream-2 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink transition hover:bg-cream-3"
      >
        {t("signIn")}
      </button>

      {open ? (
        <AuthModal
          open={open}
          onOpenChange={setOpen}
          initialMode="signin"
          onSuccess={onSuccess}
          ipCountryCode={ipCountryCode}
        />
      ) : null}
    </>
  );
}
