"use client";
import { useCompanyStore } from "@/store/companyStore";
import en from "../../public/locales/en.json";
import bn from "../../public/locales/bn.json";

type LocaleKeys = typeof en;

const LOCALES = { en, bn } as Record<string, unknown>;

export function useTranslation() {
  const { activeCompany } = useCompanyStore();
  const lang = activeCompany?.language || "en";
  const locale = (LOCALES[lang] || en) as LocaleKeys;

  function t(path: string): string {
    const parts = path.split(".");
    let current: unknown = locale;
    for (const part of parts) {
      if (typeof current !== "object" || current === null) return path;
      current = (current as Record<string, unknown>)[part];
    }
    return typeof current === "string" ? current : path;
  }

  return { t, lang };
}