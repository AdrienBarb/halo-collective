"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { useErrorStore } from "@/lib/stores/errorStore";
import { signOut } from "@/lib/better-auth/auth-client";

const GlobalErrorHandler = () => {
  const router = useRouter();
  const t = useTranslations("Errors.Toast");
  const { isError, statusCode, errorMessage, clearError } = useErrorStore();

  useEffect(() => {
    if (!isError) return;

    switch (statusCode) {
      case 401:
        signOut();
        toast.error(errorMessage || t("sessionExpired"));
        router.push("/");
        break;

      case 403:
        toast.error(errorMessage || t("forbidden"));
        break;

      case 404:
        router.push("/404");
        break;

      case 400:
        toast.error(errorMessage || t("invalidRequest"));
        break;

      case 500:
      case 502:
      case 503:
        toast.error(errorMessage || t("serverError"));
        break;

      default:
        if (errorMessage) {
          toast.error(errorMessage);
        }
    }

    const timeoutId = setTimeout(() => {
      clearError();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isError, statusCode, errorMessage, router, clearError, t]);

  return null;
};

export default GlobalErrorHandler;

