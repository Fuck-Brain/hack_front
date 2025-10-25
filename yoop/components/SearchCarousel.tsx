"use client";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { UserCard } from "./UserCard";
import {
  fetchRandomUsers,
  fetchUsersByPrompt,
  swipeUser,
  type ApiUser,
} from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchCarousel({
  prompt,
  requestKey,
  loading, // ← приходит от родителя
}: {
  prompt: string;
  requestKey?: string | null;
  loading: boolean;
}) {
  const [users, setUsers] = useState<ApiUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Стартовая подгрузка случайных (когда ещё нет requestKey)
  useEffect(() => {
    let alive = true;
    if (!requestKey) {
      fetchRandomUsers(10)
        .then((u) => alive && setUsers(u))
        .catch((e) => alive && setError(e.message));
    }
    return () => {
      alive = false;
    };
  }, [requestKey]);

  // Поиск по prompt (когда появляется requestKey)
  useEffect(() => {
    let alive = true;
    if (requestKey && prompt.trim()) {
      fetchUsersByPrompt(prompt, 10)
        .then((u) => alive && setUsers(u))
        .catch((e) => alive && setError(e.message));
    }
    return () => {
      alive = false;
    };
  }, [requestKey, prompt]);

  const onLike = async (id: string) => {
    const idemKey = `${id}:${Date.now()}`;
    setUsers((prev) => prev?.filter((u) => u.id !== id) ?? prev);
    try {
      await swipeUser(id, "like", idemKey);
    } catch {}
  };

  const onDislike = async (id: string) => {
    const idemKey = `${id}:${Date.now()}`;
    setUsers((prev) => prev?.filter((u) => u.id !== id) ?? prev);
    try {
      await swipeUser(id, "dislike", idemKey);
    } catch {}
  };

  const showSkeletons = loading || users === null;

  return (
    <Carousel opts={{ align: "start" }} className="w-full">
      <CarouselContent>
        {showSkeletons &&
          Array.from({ length: 3 }).map((_, i) => (
            <CarouselItem
              key={i}
              className="basis-full sm:basis-1/2 lg:basis-1/3"
            >
              <Skeleton className="h-[360px] w-full rounded-2xl" />
            </CarouselItem>
          ))}

        {!showSkeletons &&
          users &&
          users.map((u) => (
            <CarouselItem
              key={u.id}
              className="basis-full sm:basis-1/2 lg:basis-1/3"
            >
              <UserCard
                user={u}
                clickable
                actions
                onLike={onLike}
                onDislike={onDislike}
              />
            </CarouselItem>
          ))}

        {error && (
          <CarouselItem className="basis-full">
            <div className="text-sm text-red-400">Ошибка загрузки: {error}</div>
          </CarouselItem>
        )}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
