import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Probashi Shield - Verify Recruiting Agents | Stop Migration Fraud",
  description:
    "Check if a Bangladeshi overseas recruiting agency is BMET-licensed before you pay. Verify agents, see fraud reports, and protect your family's savings.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)] py-8">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
