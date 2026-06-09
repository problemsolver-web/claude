"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <div className="container-page flex flex-col items-center justify-between gap-4 text-sm text-slate-500 md:flex-row">
        <p>{t("footer.tagline")}</p>
        <div className="flex gap-4">
          <Link href="/safety" className="hover:text-brand">
            {t("nav.safety")}
          </Link>
          <Link href="/impact" className="hover:text-brand">
            {t("nav.impact")}
          </Link>
          <Link href="/admin/login" className="hover:text-brand">
            {t("footer.admin")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
