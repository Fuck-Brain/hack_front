"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SearchCarousel from "@/components/SearchCarousel";
import {
  apiCreateRequest,
  apiGetUserRecommendations,
  mapRecommendationsToApiUsers,
  type ApiUser,
} from "@/lib/api";

const COOLDOWN_MS = 1500;
const POLL_INTERVAL_MS = 1200;
const POLL_MAX_TRIES = 12; // ~14 сек ожидания

export default function FindPage() {
  const router = useRouter();
  const { isAuthed, user } = useAuthStore();

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ApiUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lastSentAtRef = useRef(0);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentRequestIdRef = useRef<string | null>(null);
  const isUnmountedRef = useRef(false);

  // неавторизованных уводим на главную
  useEffect(() => {
    if (!isAuthed) router.replace("/");
  }, [isAuthed, router]);

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  if (!isAuthed) return null;

  const onSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = prompt.trim();
    if (!q) return;

    if (!user?.id) {
      setError("Вы не авторизованы");
      return;
    }

    // кулдаун
    const elapsed = Date.now() - lastSentAtRef.current;
    if (elapsed < COOLDOWN_MS) {
      setError(
        `Слишком часто. Подождите ${Math.ceil((COOLDOWN_MS - elapsed) / 1000)} сек.`
      );
      return;
    }

    // сброс предыдущего поллинга
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    currentRequestIdRef.current = null;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // 1) создаём запрос — получаем ID
      const requestId = await apiCreateRequest({
        userId: user.id,
        name: "", // по ТЗ: пустая строка
        text: q,
      });
      currentRequestIdRef.current = requestId;
      lastSentAtRef.current = Date.now();

      // 2) поллим результаты
      let tries = 0;

      const poll = async () => {
        tries += 1;
        try {
          const raw = await apiGetUserRecommendations(requestId);
          // если пришли результаты — маппим в ApiUser[] и останавливаем поллинг
          if (raw && raw.length > 0) {
            if (isUnmountedRef.current) return;
            const mapped = mapRecommendationsToApiUsers(raw);
            setResults(mapped);
            setLoading(false);
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
          } else if (tries >= POLL_MAX_TRIES) {
            if (isUnmountedRef.current) return;
            setError("Не удалось получить результаты. Попробуйте позже.");
            setLoading(false);
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
          }
        } catch (err) {
          if (isUnmountedRef.current) return;
          setError(
            err instanceof Error ? err.message : "Ошибка получения результатов"
          );
          setLoading(false);
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
      };

      // запускаем один раз сразу, затем — по интервалу
      await poll();
      if (!results && !pollTimerRef.current) {
        pollTimerRef.current = setInterval(poll, POLL_INTERVAL_MS);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка поиска");
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
