"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const OnboardingModal = dynamic(
  () => import("@/components/onboarding/OnboardingModal"),
  { ssr: false },
);

export default function OnboardingGate() {
  const [open, setOpen] = useState(true);
  return <OnboardingModal open={open} onClose={() => setOpen(false)} />;
}
