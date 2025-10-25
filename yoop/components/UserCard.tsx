import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ApiUser } from "@/lib/api";

export function UserCard({
  user,
  clickable = false,
  actions = false,
  onLike,
  onDislike,
}: {
  user: ApiUser;
  clickable?: boolean; // открытие профиля по клику
  actions?: boolean; // показывать лайк/дизлайк
  onLike?: (id: string) => void;
  onDislike?: (id: string) => void;
}) {
  const Content = (
    <Card className="w-full">
      <CardContent className="p-3">
        <div className="aspect-[4/5] w-full rounded-xl bg-neutral-200" />
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold truncate" title={user.name}>
              {user.name}
            </h3>
            <span className="text-sm text-neutral-400">{user.age}</span>
          </div>
          <p className="text-sm text-neutral-400 truncate">{user.city}</p>
          <p className="line-clamp-2 text-sm text-neutral-300">{user.bio}</p>
          {actions && (
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onDislike?.(user.id)}
              >
                Дизлайк
              </Button>
              <Button className="flex-1" onClick={() => onLike?.(user.id)}>
                Лайк
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (clickable) {
    return (
      <Link href={`/user/${user.id}`} className="block select-none">
        {Content}
      </Link>
    );
  }
  return Content;
}
