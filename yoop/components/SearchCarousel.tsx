"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import SkeletonCard from "@/components/SkeletonCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ApiUser } from "@/lib/api";
import { skillsToStrings, interestsToStrings, apiLikeUser } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

type Props = {
  data?: ApiUser[] | null;
  loading?: boolean;
  emptyText?: string;
};

export default function SearchCarousel({ data, loading, emptyText }: Props) {
  const { isAuthed, user } = useAuthStore();
  const [busy, setBusy] = useState<string | null>(null);

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
    return (
      <p className="text-sm text-neutral-500">
        {emptyText ?? "Ничего не найдено."}
      </p>
    );
  }

  const fromUserId = user?.id;

  async function like(targetId: string) {
    if (!isAuthed || !fromUserId) return;
    try {
      setBusy(targetId);
      await apiLikeUser(fromUserId, targetId);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(null);
    }
  }

  async function dislike(targetId: string) {
    if (!isAuthed || !fromUserId) return;
    try {
      setBusy(targetId);
      // await apiDislikeUser(fromUserId, targetId);
      console.log("DISLIKE", { fromUserId, targetId });
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-2 snap-x [scrollbar-color:var(--muted)_transparent] [&>*]:snap-start">
      {items.map((u) => {
        // Локально собираем ФИО
        const fullName =
          [u.name, u.surName].filter(Boolean).join(" ").trim() || u.login;
        const skills = skillsToStrings(u).slice(0, 4);
        const interests = interestsToStrings(u).slice(0, 3);

        return (
          <div key={u.id} className="w-64 shrink-0 snap-start">
            <Link
              href={`/user/${encodeURIComponent(u.id)}`}
              aria-label={`Профиль ${fullName}`}
              className="block focus:outline-none"
            >
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring/60">
                <CardContent className="p-3">
                  {/* Фото / заглушка */}
                  <div className="aspect-[4/5] overflow-hidden rounded-xl bg-neutral-200/60 flex items-center justify-center">
                    <span className="text-neutral-500 text-sm select-none">
                      Фото
                    </span>
                  </div>

                  {/* Текстовый блок */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="truncate font-semibold" title={fullName}>
                        {fullName}
                      </h3>
                      {typeof u.age === "number" && (
                        <span className="text-sm text-neutral-600">
                          {u.age}
                        </span>
                      )}
                    </div>

                    {u.city && (
                      <p className="truncate text-sm text-neutral-600">
                        {u.city}
                      </p>
                    )}

                    {u.describeUser && (
                      <p className="line-clamp-2 text-sm text-neutral-700">
                        {u.describeUser}
                      </p>
                    )}

                    {/* Бейджи: скиллы */}
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {skills.map((s, i) => (
                          <Badge key={`skill-${s}-${i}`} variant="secondary">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Бейджи: интересы */}
                    {interests.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {interests.map((s, i) => (
                          <Badge key={`interest-${s}-${i}`} variant="outline">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Действия — только для авторизованных */}
            {isAuthed && (
              <div className="mt-2 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={busy === u.id}
                  onClick={() => dislike(u.id)}
                >
                  Дизлайк
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white"
                  disabled={busy === u.id}
                  onClick={() => like(u.id)}
                >
                  Лайк
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
