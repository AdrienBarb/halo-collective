"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  /**
   * Optional async work to run when the user confirms. While it runs the
   * dialog stays open with both buttons disabled. The dialog closes only
   * after the promise resolves. Errors propagate to the caller.
   */
  onConfirm?: () => Promise<void> | void;
};

type ConfirmFn = (options?: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within ConfirmProvider");
  }
  return ctx;
}

type Request = {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
};

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  // Single state unit so options and resolver can't drift apart.
  const [request, setRequest] = useState<Request | null>(null);
  const [pending, setPending] = useState(false);
  // Tracks which request the open dialog belongs to, so a late
  // onOpenChange(false) firing during a swap can't resolve the wrong promise.
  const activeRequestRef = useRef<Request | null>(null);

  const confirm = useCallback<ConfirmFn>((opts = {}) => {
    return new Promise<boolean>((resolve) => {
      setRequest((prev) => {
        // Re-entrant call: resolve the previous one to false before swapping.
        if (prev) prev.resolve(false);
        const next: Request = { options: opts, resolve };
        activeRequestRef.current = next;
        return next;
      });
      setPending(false);
    });
  }, []);

  const finish = (value: boolean) => {
    const current = activeRequestRef.current;
    if (!current) return;
    activeRequestRef.current = null;
    current.resolve(value);
    setRequest(null);
    setPending(false);
  };

  const handleCancel = () => {
    if (pending) return;
    finish(false);
  };

  const handleConfirm = async () => {
    const current = activeRequestRef.current;
    if (!current || pending) return;
    const { onConfirm } = current.options;
    if (!onConfirm) {
      finish(true);
      return;
    }
    setPending(true);
    try {
      await onConfirm();
      finish(true);
    } catch (error) {
      setPending(false);
      throw error;
    }
  };

  const {
    title = "Are you sure?",
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
  } = request?.options ?? {};

  const isDestructive = variant === "destructive";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog
        open={request !== null}
        onOpenChange={(next) => {
          if (!next) handleCancel();
        }}
      >
        <AlertDialogContent
          // Default focus to the safe action — Cancel for destructive,
          // Confirm otherwise — instead of letting Radix focus the first
          // element automatically.
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            const root = event.currentTarget as HTMLElement;
            const target = root.querySelector<HTMLButtonElement>(
              isDestructive
                ? "[data-confirm-cancel]"
                : "[data-confirm-action]",
            );
            target?.focus();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            {description ? (
              <AlertDialogDescription>{description}</AlertDialogDescription>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-confirm-cancel
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                handleCancel();
              }}
            >
              {cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              data-confirm-action
              disabled={pending}
              className={cn(
                isDestructive &&
                  buttonVariants({ variant: "destructive" }),
              )}
              onClick={(event) => {
                event.preventDefault();
                handleConfirm();
              }}
            >
              {pending ? "Working…" : confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}
