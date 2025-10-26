"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { apiLikeUser } from "@/lib/api";

type Props = {
  targetId: string;
  className?: string;
  /** Вызывается после успешного лайка */
  onLiked?: () => void;
};

export default function LikeButton({ targetId, className, onLiked }: Props) {
  const { isAuthed, user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (!isAuthed || !user?.id) return;
    try {
      setLoading(true);
      await apiLikeUser(user.id, targetId);
      onLiked?.(); // <- уведомляем родителя
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      className={`bg-green-600 hover:bg-green-500 text-white ${className ?? ""}`}
      disabled={loading || !isAuthed}
      onClick={handleLike}
      aria-label="Лайк"
    >
      <Heart className="mr-2 h-4 w-4" />
      {loading ? "..." : "Лайк"}
    </Button>
  );
}
