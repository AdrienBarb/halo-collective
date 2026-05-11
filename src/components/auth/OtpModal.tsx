"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/better-auth/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const OTP_LENGTH = 6;
const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = "email" | "otp";

interface OtpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * If provided, the modal jumps straight to the OTP step. Caller is
   * responsible for having already sent the OTP. If null/undefined, the
   * modal renders an email-input step first and sends the OTP itself.
   */
  initialEmail?: string | null;
  onSuccess: () => void;
}

function formatTimer(totalMs: number): string {
  const totalSec = Math.max(0, Math.ceil(totalMs / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function OtpModal({
  open,
  onOpenChange,
  initialEmail,
  onSuccess,
}: OtpModalProps) {
  const startedWithEmail = Boolean(initialEmail);
  const [step, setStep] = useState<Step>(startedWithEmail ? "otp" : "email");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [expiresAt, setExpiresAt] = useState(() => Date.now() + OTP_TTL_MS);
  const [resendAt, setResendAt] = useState(() => Date.now() + RESEND_COOLDOWN_MS);
  const [now, setNow] = useState(() => Date.now());

  // Single timer while modal is open.
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [open]);

  async function sendOtpForEmail(target: string): Promise<boolean> {
    setSending(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: target,
        type: "sign-in",
      });
      if (result.error) {
        setEmailError("No account found for this address.");
        return false;
      }
      const t = Date.now();
      setExpiresAt(t + OTP_TTL_MS);
      setResendAt(t + RESEND_COOLDOWN_MS);
      setNow(t);
      return true;
    } catch (error) {
      console.error("Send OTP failed:", error);
      setEmailError("Could not send the code. Try again.");
      return false;
    } finally {
      setSending(false);
    }
  }

  async function onEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    setEmailError(null);
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized)) {
      setEmailError("Invalid email address.");
      return;
    }
    setEmail(normalized);
    const ok = await sendOtpForEmail(normalized);
    if (ok) setStep("otp");
  }

  async function resendOtp() {
    if (sending) return;
    const ok = await sendOtpForEmail(email);
    if (ok) setCode("");
  }

  async function onVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (code.length !== OTP_LENGTH || verifying) return;
    setVerifying(true);
    try {
      const result = await authClient.signIn.emailOtp({ email, otp: code });
      if (result.error) {
        throw new Error(result.error.message ?? "Invalid code");
      }
      onSuccess();
    } catch (error) {
      console.error("OTP verify failed:", error);
      toast.error("Invalid or expired code. Try again.");
      setCode("");
    } finally {
      setVerifying(false);
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      const t = Date.now();
      setCode("");
      setEmail(initialEmail ?? "");
      setEmailError(null);
      setStep(startedWithEmail ? "otp" : "email");
      setExpiresAt(t + OTP_TTL_MS);
      setResendAt(t + RESEND_COOLDOWN_MS);
    }
    onOpenChange(next);
  }

  const expiresInMs = Math.max(0, expiresAt - now);
  const resendInMs = Math.max(0, resendAt - now);
  const expired = expiresInMs <= 0;
  const canResend = !sending && resendInMs <= 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-line bg-cream-2">
        {step === "email" ? (
          <>
            <DialogHeader>
              <DialogTitle>Sign in</DialogTitle>
              <DialogDescription>
                Enter your email to receive a sign-in code.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={onEmailSubmit} className="space-y-4">
              <Input
                autoFocus
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                disabled={sending}
              />
              {emailError ? (
                <p className="text-[12px] text-loss">{emailError}</p>
              ) : null}
              <button
                type="submit"
                disabled={sending || !email}
                className="w-full cursor-pointer rounded-md bg-accent-warm py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-ink transition hover:bg-accent-gold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? "Sending…" : "Send the code"}
              </button>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Sign-in code</DialogTitle>
              <DialogDescription>
                We sent a 6-digit code to{" "}
                <span className="font-medium">{email}</span>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={onVerify} className="space-y-4">
              <Input
                autoFocus
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={OTP_LENGTH}
                placeholder="123456"
                value={code}
                onChange={(e) => {
                  const digits = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, OTP_LENGTH);
                  setCode(digits);
                }}
                disabled={verifying}
                className="text-center font-mono text-[20px] tracking-[0.4em]"
              />

              <div className="flex items-center justify-between text-[12px] text-ink-3">
                <span>
                  {expired
                    ? "Code expired"
                    : `Expires in ${formatTimer(expiresInMs)}`}
                </span>
                <button
                  type="button"
                  onClick={() => void resendOtp()}
                  disabled={!canResend}
                  className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {sending
                    ? "Sending…"
                    : resendInMs > 0
                      ? `Resend (${Math.ceil(resendInMs / 1000)}s)`
                      : "Resend the code"}
                </button>
              </div>

              <button
                type="submit"
                disabled={verifying || code.length !== OTP_LENGTH || expired}
                className="w-full cursor-pointer rounded-md bg-accent-warm py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-ink transition hover:bg-accent-gold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {verifying ? "Verifying…" : "Sign in"}
              </button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
