import { Suspense } from "react";
import LikeClient from "./LikeClient";

export const metadata = {
  title: "Лайки — YooPeople",
};

export const dynamic = "force-dynamic";

export default function FindPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Suspense fallback={<div className="text-neutral-500">Загрузка…</div>}>
        <LikeClient />
      </Suspense>
    </div>
  );
}
