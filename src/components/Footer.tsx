import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function Footer() {
  const year = new Date().getFullYear();
  const t = await getTranslations("Footer");

  return (
    <footer className="relative border-t border-line bg-cream-2">
      <div className="mx-auto max-w-[1180px] px-8 pb-[30px] pt-[38px] text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
          {t("copyright", { year })}
        </div>
      </div>
      <div className="absolute right-6 top-1/2 -translate-y-1/2">
        <LanguageSwitcher />
      </div>
    </footer>
  );
}
