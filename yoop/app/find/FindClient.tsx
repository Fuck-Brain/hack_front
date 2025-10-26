"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SearchCarousel from "@/components/SearchCarousel";
import {
  apiCreateRequest,
  apiGetUserRecommendationsByPost,
  mapRecommendationsToApiUsers,
  type ApiUser,
} from "@/lib/api";

export default function FindPage() {
  const router = useRouter();
  const { isAuthed, user } = useAuthStore();

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false); // управляет скелетонами
  const [results, setResults] = useState<ApiUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthed) router.replace("/");
  }, [isAuthed, router]);

  if (!isAuthed) return null;

  const onSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = prompt.trim();
    if (!q) return;
    if (!user?.id) {
      setError("Вы не авторизованы");
      return;
    }

    setError(null);
    setResults(null);
    setLoading(true);

    try {
      // 1) создаём запрос → получаем requestId
      const requestId = await apiCreateRequest({
        userId: user.id,
        name: q, // или "" — как тебе нужно
        text: q,
      });

      if (!requestId) {
        throw new Error("Пустой requestId от /request/create");
      }

      // 2) сразу запрашиваем рекомендации по POST
      const raw = await apiGetUserRecommendationsByPost({
        userId: user.id,
        requestId,
      });

      const arr = Array.isArray(raw) ? raw : [];
      if (arr.length === 0) {
        setError("Ничего не найдено по этому запросу.");
        setResults([]);
      } else {
        setResults(mapRecommendationsToApiUsers(arr));
      }
    } catch (err) {
      console.error("[find] error:", err);
      setError(err instanceof Error ? err.message : "Ошибка поиска");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-28">
      <h1 className="text-2xl font-bold">Найти людей</h1>

      <div className="mt-4">
        <SearchCarousel data={results ?? []} loading={loading} />
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>

      <form
        onSubmit={onSearch}
        className="fixed left-1/2 bottom-6 z-20 w-[92vw] max-w-3xl -translate-x-1/2"
      >
        <div className="flex items-center gap-2 rounded-full border border-border bg-neutral-900/60 px-4 py-3 shadow-2xl backdrop-blur-md">
          <Input
            value={prompt}
            onChange={(e) => {
              if (error) setError(null);
              setPrompt(e.target.value);
            }}
            placeholder="Кого ищем? (например: «Frontend React»)"
            className="h-10 flex-1 border-none bg-transparent text-foreground placeholder:text-neutral-500 focus-visible:ring-0"
          />
          <Button
            type="submit"
            disabled={loading}
            className="h-10 w-10 rounded-full bg-primary p-0 text-primary-foreground hover:opacity-90 disabled:opacity-60"
            title="Найти"
          >
            →
          </Button>
        </div>
      </form>
    </div>
  );
}
