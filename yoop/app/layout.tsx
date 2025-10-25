import "./globals.css";
import type { Metadata } from "next";
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
        <Header />
        <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">{children}</main>
        <AuthModals />
      </body>
    </html>
  );
}
