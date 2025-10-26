"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { apiGetLiked, type LikedUser } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function LikesPage() {
  const router = useRouter();
  const { isAuthed, user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<LikedUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  // редирект гость -> главная
  useEffect(() => {
    if (!isAuthed) router.replace("/");
  }, [isAuthed, router]);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!user?.id) return;

      setLoading(true);
      setError(null);
      try {
        // ↓↓↓ пока нет API — используем моки ↓↓↓
        const mockData: LikedUser[] = [
          {
            id: "1",
            login: "sanya_dev",
            photoHash: "",
            name: "Александр",
            surName: "Погодин",
            fatherName: "Иванович",
            age: 24,
            gender: "male",
            describeUser: "Люблю фронтенд, котиков и чистый код.",
            city: "Москва",
            skills: ["React", "TypeScript", "Next.js"],
            interests: ["ИИ", "UX-дизайн"],
            hobbies: ["Музыка", "Горы", "Фотография"],
          },
          {
            id: "2",
            login: "maria_code",
            photoHash: "",
            name: "Мария",
            surName: "Кузнецова",
            fatherName: "Алексеевна",
            age: 27,
            gender: "female",
            describeUser:
              "Backend-разработчица, люблю Go и хорошую архитектуру.",
            city: "Санкт-Петербург",
            skills: ["Go", "PostgreSQL", "Docker"],
            interests: ["Open Source", "Чай"],
            hobbies: ["Путешествия", "Настольные игры"],
          },
          {
            id: "3",
            login: "ilya_ml",
            photoHash: "",
            name: "Илья",
            surName: "Смирнов",
            fatherName: "Петрович",
            age: 29,
            gender: "male",
            describeUser:
              "Data Scientist, экспериментирую с LLM и компьютерным зрением.",
            city: "Новосибирск",
            skills: ["Python", "TensorFlow", "PyTorch"],
            interests: ["ML", "Data Viz"],
            hobbies: ["Бег", "Фотография"],
          },
          {
            id: "3",
            login: "ilya_ml",
            photoHash: "",
            name: "Илья",
            surName: "Смирнов",
            fatherName: "Петрович",
            age: 29,
            gender: "male",
            describeUser:
              "Data Scientist, экспериментирую с LLM и компьютерным зрением.",
            city: "Новосибирск",
            skills: ["Python", "TensorFlow", "PyTorch"],
            interests: ["ML", "Data Viz"],
            hobbies: ["Бег", "Фотография"],
          },
        ];

        // в будущем можно заменить на:
        // const data = await apiGetLiked(user.id);
        const data = mockData;

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
  }, [user?.id]);

  if (!isAuthed) return null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">История лайков</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Пользователи, которым вы поставили лайк
        </p>
      </header>

      {loading ? (
        <GridSkeleton />
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-neutral-500">Вы ещё никого не лайкнули.</p>
      ) : (
        <GridList users={items} />
      )}
    </div>
  );
}

// --- список карточек ---
function GridList({ users }: { users: LikedUser[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((u) => (
        <UserCard key={u.id} user={u} />
      ))}
    </div>
  );
}

// --- карточка пользователя ---
function UserCard({ user }: { user: LikedUser }) {
  const fullName = `${user.surName} ${user.name} ${user.fatherName}`.trim();
  const initials = (user.name?.[0] ?? "") + (user.surName?.[0] ?? "") || "U";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
          {/* Если появится прямой URL к фото — подменим Avatar на <img src=... /> */}
          <AvatarFallback className="bg-neutral-800 text-neutral-200">
            {initials.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <CardTitle className="truncate">{fullName}</CardTitle>
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
      </CardContent>
    </Card>
  );
}

// --- ряд с бэйджами ---
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

// --- скелетоны грида ---
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
