import "./globals.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import { mulish } from "@/lib/fonts";
import Header from "@/components/Header";
import AuthModals from "@/components/AuthModals";

export const metadata: Metadata = {
  title: "YooPeople",
  description: "Поиск людей по интересам",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${mulish.className} bg-background text-foreground`}>
        {/* Куски с клиентскими хуками (Header/AuthModals) прячем в Suspense */}
        <Suspense fallback={null}>
          <Header />
        </Suspense>

        {/* Можно тоже обернуть main — безопасно для страниц с CSR */}
        <Suspense fallback={null}>
          <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">{children}</main>
        </Suspense>

        <Suspense fallback={null}>
          <AuthModals />
        </Suspense>
      </body>
    </html>
  );
}
