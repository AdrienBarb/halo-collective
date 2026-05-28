import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function Footer() {
  const year = new Date().getFullYear();
  const t = await getTranslations("Footer");

  return (
    <footer className="relative border-t border-line bg-cream-2">
      <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-3 px-4 pb-[30px] pt-[38px] md:block md:px-8 md:text-center">
        <div className="font-sans text-[10px] uppercase tracking-[0.22em] text-ink-3">
          {t("copyright", { year })}
        </div>
        <div className="md:hidden">
          <LanguageSwitcher />
        </div>
      </div>
      <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 md:block">
        <LanguageSwitcher />
      </div>
    </footer>
  );
}
