import { Suspense } from "react";
import Link from "next/link";

// Серверный компонент-обёртка (без "use client")
export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">404 — страница не найдена</h1>
      <p className="mt-2 text-neutral-500">
        Кажется, вы попали не туда. Проверьте адрес или вернитесь на главную.
      </p>

      {/* ВАЖНО: useSearchParams — только внутри Suspense и client-компонента */}
      <Suspense fallback={null}>
        <NotFoundInner />
      </Suspense>

      <div className="mt-6">
        <Link href="/" className="underline">
          На главную
        </Link>
      </div>
    </div>
  );
}

// ===== Клиентский внутренний компонент =====
function NotFoundInner() {
  "use client";
  // импортим хук только внутри client-компонента
  const { useSearchParams } =
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("next/navigation") as typeof import("next/navigation");
  const params = useSearchParams();

  // Пример: покажем утилитарные параметры, если они есть
  const from = params.get("from");
  const q = params.get("q");

  if (!from && !q) return null;

  return (
    <div className="mt-4 text-sm text-neutral-400">
      {from && (
        <div>
          Источник: <span className="font-mono">{from}</span>
        </div>
      )}
      {q && (
        <div>
          Поисковый запрос: <span className="font-mono">{q}</span>
        </div>
      )}
    </div>
  );
}
