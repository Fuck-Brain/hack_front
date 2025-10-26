"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  apiGetLiked,
  apiHasLiked,
  apiLikeUser,
  type LikedUser,
} from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type Tab = "byMe" | "toMe"; // byMe — кого лайкнул я; toMe — кто лайкнул меня

export default function LikesPage() {
  const router = useRouter();
  const { isAuthed, user, hydrated } = useAuthStore();

  // ВСЕ ХУКИ — НАВЕРХУ, БЕЗ УСЛОВИЙ
  const [tab, setTab] = useState<Tab>("byMe");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<LikedUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Редирект неавторизованных — через useEffect (не условный return)
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthed) router.replace("/");
  }, [hydrated, isAuthed, router]);

  // Загрузка данных в зависимости от вкладки
  useEffect(() => {
    let alive = true;
    async function load() {
      if (!hydrated || !isAuthed || !user?.id) return;

      setLoading(true);
      setError(null);
      try {
        const data =
          tab === "byMe"
            ? await apiGetLiked(user.id) // я лайкнул
            : await apiHasLiked(user.id); // меня лайкнули

        if (!alive) return;
        setItems(data ?? []);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Ошибка загрузки";
        if (!alive) return;
        setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [hydrated, isAuthed, user?.id, tab]);

  // Лайк «в ответ» для вкладки "Меня лайкнули"
  const likeBack = async (targetId: string) => {
    if (!user?.id) return;
    try {
      setBusyId(targetId);
      await apiLikeUser(user.id, targetId);
      // опционально: оптимистично скрыть карточку из списка
      setItems((prev) => prev.filter((u) => u.id !== targetId));
    } catch (e) {
      console.error(e);
    } finally {
      setBusyId(null);
    }
  };

  // ВОЗВРАТ JSX — ОДИН РАЗ, ХУКОВ НИЖЕ НЕТ
  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Лайки</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Переключайте вкладки, чтобы посмотреть разные списки
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-border p-1 bg-neutral-900/60">
          <Button
            type="button"
            variant={tab === "byMe" ? "default" : "ghost"}
            className="rounded-lg"
            onClick={() => setTab("byMe")}
          >
            Я лайкнул
          </Button>
          <Button
            type="button"
            variant={tab === "toMe" ? "default" : "ghost"}
            className="rounded-lg"
            onClick={() => setTab("toMe")}
          >
            Меня лайкнули
          </Button>
        </div>
      </header>

      {!hydrated || loading ? (
        <GridSkeleton />
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-neutral-500">
          {tab === "byMe"
            ? "Вы ещё никого не лайкнули."
            : "Пока что никто не лайкнул ваш профиль."}
        </p>
      ) : (
        <GridList
          users={items}
          mode={tab}
          likeBack={likeBack}
          busyId={busyId}
        />
      )}
    </div>
  );
}

// === список карточек ===
function GridList({
  users,
  mode,
  likeBack,
  busyId,
}: {
  users: LikedUser[];
  mode: "byMe" | "toMe";
  likeBack: (id: string) => void;
  busyId: string | null;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((u) => (
        <UserCard
          key={u.id}
          user={u}
          mode={mode}
          likeBack={likeBack}
          busyId={busyId}
        />
      ))}
    </div>
  );
}

// === карточка пользователя ===
function UserCard({
  user,
  mode,
  likeBack,
  busyId,
}: {
  user: LikedUser;
  mode: "byMe" | "toMe";
  likeBack: (id: string) => void;
  busyId: string | null;
}) {
  const fullName = `${user.surName} ${user.name} ${user.fatherName}`.trim();
  const initials =
    ((user.name?.[0] ?? "") + (user.surName?.[0] ?? "")).toUpperCase() || "U";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
          {/* Если появится прямой URL к фото — подмените Avatar на <img src=... /> */}
          <AvatarFallback className="bg-neutral-800 text-neutral-200">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <CardTitle className="truncate">{fullName || user.login}</CardTitle>
          <p className="text-sm text-neutral-500">
            {user.age} • {user.city}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {user.describeUser && (
          <p className="text-sm text-neutral-300">{user.describeUser}</p>
        )}

        {user.skills?.length > 0 && (
          <RowChips label="Навыки" items={user.skills} />
        )}
        {user.interests?.length > 0 && (
          <RowChips label="Интересы" items={user.interests} />
        )}
        {user.hobbies?.length > 0 && (
          <RowChips label="Хобби" items={user.hobbies} />
        )}

        {mode === "toMe" && (
          <div className="pt-2">
            <Button
              className="w-full"
              disabled={busyId === user.id}
              onClick={() => likeBack(user.id)}
            >
              {busyId === user.id ? "..." : "Лайкнуть в ответ"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// === ряд с бэйджами ===
function RowChips({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((t, i) => (
          <Badge
            key={`${t}-${i}`}
            variant="secondary"
            className="bg-neutral-800 text-neutral-200"
          >
            {t}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// === скелетоны ===
function GridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex-row items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <div className="mt-3 flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
