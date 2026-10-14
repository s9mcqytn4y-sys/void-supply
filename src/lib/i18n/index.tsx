"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { id, Dictionary } from "./dictionaries/id";
import { en } from "./dictionaries/en";

export type Locale = "id" | "en";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}

const I18nContext = createContext<I18nContextType>({
  locale: "id",
  setLocale: () => {},
  t: id,
});

const COOKIE_NAME = "void_locale";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("id");

  useEffect(() => {
    try {
      const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${COOKIE_NAME}=`));
      if (match) {
        const val = match.split("=")[1];
        if (val === "id" || val === "en") {
          setLocaleState(val);
        }
      }
    } catch {
      // Fallback default
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      document.cookie = `${COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Silent catch
    }
  };

  const t = useMemo(() => (locale === "en" ? en : id), [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
