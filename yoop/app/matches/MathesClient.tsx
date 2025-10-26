// app/matches/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { apiGetMatches, type ApiMatchUser } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MatchesPage() {
  const router = useRouter();
  const { hydrated, isAuthed, user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ApiMatchUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ждём гидратацию и проверяем авторизацию
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthed) router.replace("/");
  }, [hydrated, isAuthed, router]);

  // загрузка совпадений, когда всё готово
  useEffect(() => {
    const uid = user?.id;
    if (!hydrated || !isAuthed || !uid) return;

    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGetMatches(uid!);
        if (!alive) return;
        setItems(data);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Ошибка загрузки";
        if (alive) setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [hydrated, isAuthed, user?.id]);

  // экраны состояния
  if (!hydrated) {
    return (
      <div className="flex justify-center items-center h-80 text-neutral-400">
        Загрузка профиля...
      </div>
    );
  }
  if (!isAuthed) return null;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
        <h1 className="text-2xl font-bold text-accent">Совпадения</h1>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-background/60 border-border">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold text-accent">Совпадения</h1>
        <p className="mt-4 text-red-400">Ошибка: {error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-accent">Совпадения</h1>

      {items.length === 0 ? (
        <p className="text-neutral-400">Пока совпадений нет.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((u) => (
            <Card
              key={u.id}
              className="bg-background/60 border-border hover:border-primary/40 transition-colors"
            >
              <CardHeader>
                <CardTitle className="truncate">
                  {u.name} {u.surName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-neutral-400">{u.city}</p>
                <p className="text-sm text-neutral-400">{u.age} лет</p>
                {u.describeUser && (
                  <p className="text-sm text-neutral-300 line-clamp-3">
                    {u.describeUser}
                  </p>
                )}
                {u.skills?.length > 0 && (
                  <p className="text-xs text-neutral-500">
                    Навыки: {u.skills.slice(0, 5).join(", ")}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
