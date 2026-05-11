"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ── Editorial form atoms ──────────────────────────────────────────────
//
// These atoms are used for the per-section content inputs that live in
// local React state (not RHF). They give the form a calm editorial
// rhythm: mono eyebrow labels, generous breathing room, and a single
// hairline divider style on cards.

export function FieldLabel({
  htmlFor,
  children,
  className,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "block font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3",
        className,
      )}
    >
      {children}
    </label>
  );
}

export function FieldHelp({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-[11px] leading-snug text-ink-3", className)}>
      {children}
    </p>
  );
}

interface FieldProps {
  label?: React.ReactNode;
  help?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, help, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      {children}
      {help ? <FieldHelp>{help}</FieldHelp> : null}
    </div>
  );
}

interface TextFieldProps {
  label?: React.ReactNode;
  help?: React.ReactNode;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "number" | "url";
  className?: string;
}

export function TextField({
  label,
  help,
  placeholder,
  value,
  onChange,
  type = "text",
  className,
}: TextFieldProps) {
  return (
    <Field label={label} help={help} className={className}>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

interface TextareaFieldProps {
  label?: React.ReactNode;
  help?: React.ReactNode;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  className?: string;
}

export function TextareaField({
  label,
  help,
  placeholder,
  value,
  onChange,
  rows = 6,
  className,
}: TextareaFieldProps) {
  return (
    <Field label={label} help={help} className={className}>
      <Textarea
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

// ── FieldGroup ─────────────────────────────────────────────────────────
//
// A sunken sub-region inside a section, with a small mono label header.
// Used for "Pull quote", "CTA", "Media", etc. — optional blocks that
// editors will mostly leave empty.

export function FieldGroup({
  label,
  trailing,
  children,
}: {
  label: React.ReactNode;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-sm border border-line bg-cream-2 p-4">
      <div className="flex items-center justify-between gap-2">
        <FieldLabel>{label}</FieldLabel>
        {trailing}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
