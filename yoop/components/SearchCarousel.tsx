"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SkeletonCard from "@/components/SkeletonCard";
import type { ApiProfile } from "@/lib/api";

type Props = {
  data?: ApiProfile[] | null; // результаты поиска
  loading?: boolean; // флаг загрузки для скелетонов
};

export default function SearchCarousel({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="flex gap-6 overflow-x-auto pb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const items = data ?? [];

  if (items.length === 0) {
    return <p className="text-neutral-500">Ничего не найдено.</p>;
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-2">
      {items.map((p) => (
        <Card key={p.id} className="w-64 shrink-0">
          <CardContent className="p-3">
            <div className="aspect-[4/5] overflow-hidden rounded-xl bg-neutral-200" />
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="truncate font-semibold" title={p.name}>
                  {p.name}
                </h3>
                {typeof p.age === "number" && (
                  <span className="text-sm text-neutral-600">{p.age}</span>
                )}
              </div>
              {p.city && (
                <p className="truncate text-sm text-neutral-600">{p.city}</p>
              )}
              {p.bio && (
                <p className="line-clamp-2 text-sm text-neutral-700">{p.bio}</p>
              )}

              <div className="mt-3 flex gap-2">
                <Button variant="outline" className="flex-1">
                  Дизлайк
                </Button>
                <Button className="flex-1">Лайк</Button>
              </div>

              <Link
                href={`/user/${p.id}`}
                className="mt-2 inline-block text-sm underline"
              >
                Профиль
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
