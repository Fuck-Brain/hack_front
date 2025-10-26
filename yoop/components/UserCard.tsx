"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LikeButton from "@/components/LikeButton";
import type { ApiUser } from "@/lib/api";
import { skillsToStrings, interestsToStrings } from "@/lib/api"; // ⬅️ убрали getFullName

type Props = {
  user: ApiUser;
  clickable?: boolean;
  actions?: boolean;
  onLike?: (id: string) => void;
  onDislike?: (id: string) => void;
};

export default function UserCard({
  user,
  clickable = false,
  actions = false,
  onLike,
  onDislike,
}: Props) {
  // локально собираем ФИО
  const fullName =
    [user.name, user.surName].filter(Boolean).join(" ").trim() || user.login;

  const bio = user.describeUser || "";
  const skills = skillsToStrings(user).slice(0, 4);
  const interests = interestsToStrings(user).slice(0, 3);

  const InfoBlock = (
    <div className="space-y-2">
      <div className="aspect-[4/5] w-full rounded-xl bg-neutral-200/60 flex items-center justify-center">
        <span className="text-neutral-500 text-sm select-none">Фото</span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <h3 className="truncate font-semibold" title={fullName}>
            {fullName}
          </h3>
          {typeof user.age === "number" && (
            <span className="text-sm text-neutral-500">{user.age}</span>
          )}
        </div>

        {user.city && (
          <p className="truncate text-sm text-neutral-600">{user.city}</p>
        )}

        {bio && <p className="line-clamp-2 text-sm text-neutral-700">{bio}</p>}

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {skills.map((s, i) => (
              <Badge key={`skill-${s}-${i}`} variant="secondary">
                {s}
              </Badge>
            ))}
          </div>
        )}

        {interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {interests.map((it, i) => (
              <Badge key={`interest-${it}-${i}`} variant="outline">
                {it}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardContent className="p-3">
        {clickable ? (
          <Link
            href={`/user/${encodeURIComponent(user.id)}`}
            className="block focus:outline-none transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring/60 rounded-lg"
            aria-label={`Профиль ${fullName}`}
          >
            {InfoBlock}
          </Link>
        ) : (
          <div className="transition-all">{InfoBlock}</div>
        )}

        {actions && (
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDislike?.(user.id);
              }}
            >
              Дизлайк
            </Button>

            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="flex-1"
            >
              <LikeButton
                targetId={user.id}
                onLiked={() => onLike?.(user.id)}
                className="w-full"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
