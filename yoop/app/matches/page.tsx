import { Suspense } from "react";
import MatchesClient from "./MathesClient";

export const metadata = {
  title: "Совпадения — YooPeople",
};

export const dynamic = "force-dynamic";

export default function FindPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Suspense fallback={<div className="text-neutral-500">Загрузка…</div>}>
        <MatchesClient />
      </Suspense>
    </div>
  );
}
