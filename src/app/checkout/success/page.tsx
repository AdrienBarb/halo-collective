import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default async function CheckoutSuccessPage() {
  const t = await getTranslations("Checkout.Success");
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
          <p className="text-xl text-muted-foreground mb-8">{t("body")}</p>
        </div>
        <div className="space-y-4">
          <p className="text-muted-foreground">{t("receiptNote")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/">{t("dashboardCta")}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/pricing">{t("plansCta")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
