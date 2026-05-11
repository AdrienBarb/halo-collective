"use client";

import { useFormContext } from "react-hook-form";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import LogoUploader from "@/components/admin/LogoUploader";
import type { CreateAthleteInput } from "@/lib/schemas/athlete";

interface SponsorRowProps {
  index: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export default function SponsorRow({
  index,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: SponsorRowProps) {
  const form = useFormContext<CreateAthleteInput>();
  const name = form.watch(`sponsors.${index}.name` as const);

  function handleRemove() {
    const label = name?.trim() || "this sponsor";
    if (confirm(`Remove ${label}?`)) {
      onRemove();
    }
  }

  return (
    <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-3 rounded-sm border border-line bg-cream p-4">
      <FormField
        control={form.control}
        name={`sponsors.${index}.logoUrl` as const}
        render={({ field }) => (
          <FormItem className="row-span-2">
            <FormControl>
              <LogoUploader
                value={field.value || null}
                onChange={(url) => field.onChange(url)}
                size={64}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`sponsors.${index}.name` as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
              Name
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="Rolex"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="row-span-2 flex flex-col items-end justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-11 w-11"
            disabled={!canMoveUp}
            onClick={onMoveUp}
            aria-label="Move sponsor up"
          >
            <ArrowUp className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-11 w-11"
            disabled={!canMoveDown}
            onClick={onMoveDown}
            aria-label="Move sponsor down"
          >
            <ArrowDown className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-11 w-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleRemove}
          aria-label="Remove sponsor"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      <FormField
        control={form.control}
        name={`sponsors.${index}.websiteUrl` as const}
        render={({ field }) => (
          <FormItem className="col-start-2">
            <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
              Website
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="https://rolex.com"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
