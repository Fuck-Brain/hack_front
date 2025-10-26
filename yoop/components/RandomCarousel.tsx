"use client";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import UserCard from "./UserCard";

import { fetchRandomUsers, type ApiUser } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function RandomCarousel() {
  const [users, setUsers] = useState<ApiUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchRandomUsers(10)
      .then((u) => alive && setUsers(u)) // ✓ асинхронный setState — норм
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  const loading = users === null;

  return (
    <Carousel opts={{ align: "start" }} className="w-full">
      <CarouselContent>
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <CarouselItem
              key={i}
              className="basis-full sm:basis-1/2 lg:basis-1/3"
            >
              <Skeleton className="h-[360px] w-full rounded-2xl" />
            </CarouselItem>
          ))}

        {!loading &&
          users!.slice(0, 10).map((u) => (
            <CarouselItem
              key={u.id}
              className="basis-full sm:basis-1/2 lg:basis-1/3"
            >
              <UserCard user={u} clickable={false} actions={false} />
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
