"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "bn";

// Translation dictionary. Keys are flat dotted strings.
const dict: Record<Lang, Record<string, string>> = {
  en: {
    "brand.name": "Probashi Shield",
    "nav.verify": "Verify Agency",
    "nav.fees": "Country Fees",
    "nav.safety": "Safety Guide",
    "nav.sms": "SMS Demo",
    "nav.track": "Track Report",
    "nav.impact": "Impact",
    "nav.report": "Report Fraud",
    "nav.report.short": "Report",

    "home.title": "Before you pay, verify the agent.",
    "home.subtitle":
      "Every year thousands of Bangladeshi workers lose 3-5 lakh taka to fake recruiting agents. Check any agency against the official BMET licensed list in seconds - free.",
    "home.byName": "By Name",
    "home.byLicense": "By License #",
    "home.byPhone": "By Phone",
    "home.placeholder": "e.g. Gulf Gateway, RL-1024, 01711...",
    "home.verify": "Verify",
    "home.searching": "Searching...",
    "home.try": "Try:",
    "home.noResultTitle": "No licensed agency found matching",
    "home.noResultBody":
      "This agency is NOT in the BMET licensed list. Do not send money until you verify. If someone is using this name to collect money,",
    "home.reportItHere": "report it here",
    "home.resultsFound": "results found",
    "home.reports": "reports",
    "home.step1.t": "1. Search",
    "home.step1.d": "Enter the agency name, BMET license number, or phone number.",
    "home.step2.t": "2. See the verdict",
    "home.step2.d": "Instantly know if they are licensed and how many fraud reports exist.",
    "home.step3.t": "3. Decide safely",
    "home.step3.d": "Never hand over your land money to an unverified agent again.",

    "footer.tagline":
      "Probashi Shield - Protecting Bangladesh's migrant workers from recruitment fraud.",
    "footer.admin": "Admin",
  },
  bn: {
    "brand.name": "প্রবাসী শিল্ড",
    "nav.verify": "এজেন্সি যাচাই",
    "nav.fees": "দেশভিত্তিক খরচ",
    "nav.safety": "নিরাপত্তা নির্দেশিকা",
    "nav.sms": "এসএমএস ডেমো",
    "nav.track": "রিপোর্ট ট্র্যাক",
    "nav.impact": "প্রভাব",
    "nav.report": "প্রতারণা রিপোর্ট",
    "nav.report.short": "রিপোর্ট",

    "home.title": "টাকা দেওয়ার আগে এজেন্ট যাচাই করুন।",
    "home.subtitle":
      "প্রতি বছর হাজার হাজার বাংলাদেশি কর্মী ভুয়া এজেন্টের কাছে ৩-৫ লাখ টাকা হারান। যেকোনো এজেন্সিকে সরকারি বিএমইটি লাইসেন্স তালিকার সাথে সেকেন্ডেই যাচাই করুন - বিনামূল্যে।",
    "home.byName": "নাম দিয়ে",
    "home.byLicense": "লাইসেন্স নম্বর",
    "home.byPhone": "ফোন নম্বর",
    "home.placeholder": "যেমন: Gulf Gateway, RL-1024, 01711...",
    "home.verify": "যাচাই করুন",
    "home.searching": "খোঁজা হচ্ছে...",
    "home.try": "চেষ্টা করুন:",
    "home.noResultTitle": "এই নামে কোনো লাইসেন্সপ্রাপ্ত এজেন্সি পাওয়া যায়নি",
    "home.noResultBody":
      "এই এজেন্সিটি বিএমইটি লাইসেন্স তালিকায় নেই। যাচাই না করে টাকা দেবেন না। কেউ যদি এই নামে টাকা নিচ্ছে,",
    "home.reportItHere": "এখানে রিপোর্ট করুন",
    "home.resultsFound": "টি ফলাফল পাওয়া গেছে",
    "home.reports": "টি রিপোর্ট",
    "home.step1.t": "১. খুঁজুন",
    "home.step1.d": "এজেন্সির নাম, বিএমইটি লাইসেন্স নম্বর বা ফোন নম্বর লিখুন।",
    "home.step2.t": "২. ফলাফল দেখুন",
    "home.step2.d": "সাথে সাথেই জানুন তারা লাইসেন্সপ্রাপ্ত কিনা এবং কতগুলো প্রতারণার রিপোর্ট আছে।",
    "home.step3.t": "৩. নিরাপদে সিদ্ধান্ত নিন",
    "home.step3.d": "আর কখনো অযাচাইকৃত এজেন্টের হাতে আপনার জমি বিক্রির টাকা তুলে দেবেন না।",

    "footer.tagline":
      "প্রবাসী শিল্ড - বাংলাদেশের অভিবাসী কর্মীদের প্রতারণা থেকে রক্ষা করছে।",
    "footer.admin": "অ্যাডমিন",
  },
};

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  setLang: () => undefined,
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("ps_lang") as Lang) : null;
    if (saved === "en" || saved === "bn") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("ps_lang", l);
  };

  const t = (key: string) => dict[lang][key] ?? dict.en[key] ?? key;

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function LanguageToggle() {
  const { lang, setLang } = useI18n();
  return (
    <button
      onClick={() => setLang(lang === "en" ? "bn" : "en")}
      className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
      aria-label="Toggle language"
    >
      {lang === "en" ? "বাংলা" : "English"}
    </button>
  );
}
