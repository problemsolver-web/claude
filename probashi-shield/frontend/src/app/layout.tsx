import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Probashi Shield - Verify Recruiting Agents | Stop Migration Fraud",
  description:
    "Check if a Bangladeshi overseas recruiting agency is BMET-licensed before you pay. Verify agents, see fraud reports, and protect your family's savings.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)] py-8">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-8">
          <div className="container-page flex flex-col items-center justify-between gap-4 text-sm text-slate-500 md:flex-row">
            <p>
              Probashi Shield - Protecting Bangladesh&apos;s migrant workers from
              recruitment fraud.
            </p>
            <div className="flex gap-4">
              <Link href="/safety" className="hover:text-brand">Safety Guide</Link>
              <Link href="/admin/login" className="hover:text-brand">Admin</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
