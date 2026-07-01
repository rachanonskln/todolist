import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { translations, type Locale, type TranslationShape } from "./translations";

const STORAGE_KEY = "aurora-tasks-locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationShape;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readInitialLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "th") return stored;
  // Thai-first default: this app's primary audience is Thai-speaking users.
  return "th";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  const setLocale = (next: Locale) => {
    localStorage.setItem(STORAGE_KEY, next);
    setLocaleState(next);
  };

  const value = useMemo(
    () => ({ locale, setLocale, t: translations[locale] }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}
