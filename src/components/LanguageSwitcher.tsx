"use client";

import { Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_FLAGS,
  LOCALE_LABELS,
  LOCALES,
  type Locale,
} from "@/i18n/locales";
import { setLocale } from "@/lib/actions/setLocale";

export function LanguageSwitcher() {
  const router = useRouter();
  const raw = useLocale();
  const currentLocale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = useTranslations("LanguageSwitcher");

  const handleSelect = async (next: Locale) => {
    if (next === currentLocale) return;
    await setLocale(next);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t("label")}
          className="gap-2"
        >
          <span className="text-base leading-none">
            {LOCALE_FLAGS[currentLocale]}
          </span>
          <span className="font-mono text-xs uppercase tracking-wider">
            {currentLocale}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LOCALES.map((locale) => {
          const isActive = locale === currentLocale;
          return (
            <DropdownMenuItem
              key={locale}
              onSelect={() => handleSelect(locale)}
              className="justify-between gap-3"
            >
              <span className="flex items-center gap-2">
                <span className="text-base leading-none">
                  {LOCALE_FLAGS[locale]}
                </span>
                <span>{LOCALE_LABELS[locale]}</span>
              </span>
              {isActive ? (
                <Check className="h-4 w-4 text-muted-foreground" />
              ) : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
