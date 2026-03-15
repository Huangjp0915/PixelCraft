import { zh } from "./zh";
import { en } from "./en";
import { useLanguageStore } from "@/store/useLanguageStore";

export type Translation = typeof zh;

export const translations = {
  zh,
  en,
};

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  return translations[language];
}
