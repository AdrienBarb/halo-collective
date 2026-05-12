"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AuthForm from "@/components/auth/AuthForm";

type Mode = "signin" | "signup";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: Mode;
  onSuccess: () => void;
  ipCountryCode?: string | null;
  redirectAfter?: string;
}

export default function AuthModal({
  open,
  onOpenChange,
  initialMode = "signup",
  onSuccess,
  ipCountryCode,
  redirectAfter,
}: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);

  function handleOpenChange(next: boolean) {
    if (!next) setMode(initialMode);
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md border-line bg-cream-2">
        <DialogHeader>
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-gold">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </div>
          <DialogTitle className="font-serif text-[24px] font-semibold tracking-[-0.015em] text-ink">
            {mode === "signup" ? "Join Halo Collective" : "Sign in to Halo"}
          </DialogTitle>
        </DialogHeader>

        <AuthForm
          mode={mode}
          onSuccess={onSuccess}
          onModeChange={setMode}
          ipCountryCode={ipCountryCode}
          redirectAfter={redirectAfter}
        />
      </DialogContent>
    </Dialog>
  );
}
