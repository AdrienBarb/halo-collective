"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
        Sign in
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
