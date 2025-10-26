"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SearchCarousel from "@/components/SearchCarousel";
import { apiCreateRequest, type ApiProfile } from "@/lib/api";

const COOLDOWN_MS = 1500; // анти-спам: минимум 1.5с между отправками

export default function FindPage() {
  const router = useRouter();
  const { isAuthed, user } = useAuthStore();

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ApiProfile[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lastSentAtRef = useRef<number>(0);
  const abortRef = useRef<AbortController | null>(null);
  const userId = user?.id;
  // Неавторизованных сразу уводим на главную (без модалок)
  useEffect(() => {
    if (!isAuthed) router.replace("/");
  }, [isAuthed, router]);

  const cooldownLeft = Math.max(
    0,
    COOLDOWN_MS - (Date.now() - lastSentAtRef.current)
  );

  if (!isAuthed) return null;

  const onSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = prompt.trim();
    if (!q) return;
    if (!userId) {
      setError("Вы не авторизованы");
      return;
    }

    // анти-спам кулдаун
    const elapsed = Date.now() - lastSentAtRef.current;
    if (elapsed < COOLDOWN_MS) {
      setError(
        `Слишком часто. Подождите ${Math.ceil((COOLDOWN_MS - elapsed) / 1000)} сек.`
      );
      return;
    }

    // отменяем предыдущий запрос, если он ещё идёт
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // по ТЗ "name" = "" — но обязателен
      const data = await apiCreateRequest(
        { userId, name: "", text: q }
        // если нужен AbortController, добавь поддержку в request<T> и передай { signal: ac.signal }
      );
      setResults(data);
      lastSentAtRef.current = Date.now();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  return (
    <div className="space-y-6 pb-28">
      <h1 className="text-2xl font-bold">Найти людей</h1>

      <div className="mt-4">
        <SearchCarousel data={results ?? []} loading={loading} />
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>

      {/* Поисковая строка — снизу фиксировано */}
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
            placeholder="Кого ищем? (пример: «Frontend React»)"
            className="h-10 flex-1 border-none bg-transparent text-foreground placeholder:text-neutral-500 focus-visible:ring-0"
          />
          <Button
            type="submit"
            disabled={loading || cooldownLeft > 0}
            className="h-10 w-10 rounded-full bg-primary p-0 text-primary-foreground hover:opacity-90 disabled:opacity-60"
            title={
              cooldownLeft > 0
                ? `Подождите ${Math.ceil(cooldownLeft / 1000)} c`
                : "Найти"
            }
          >
            →
          </Button>
        </div>
      </form>
    </div>
  );
}
