"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import UserCard from "@/components/UserProfile/UserCard";
import {
  ApiUser,
  fetchUserById,
  updateUserProfile,
  type UpdateUserPayload,
} from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const { user: authUser, token: authToken } = useAuthStore();

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const idFromStore = authUser?.id;
        const tokenFromStore = authToken;
        const idFromStorage =
          typeof window !== "undefined"
            ? window.localStorage.getItem("userId")
            : null;
        const tokenFromStorage =
          typeof window !== "undefined"
            ? window.localStorage.getItem("token")
            : null;

        const resolvedId = idFromStore || idFromStorage;
        const resolvedToken = tokenFromStore || tokenFromStorage || undefined;

        if (!resolvedId) {
          throw new Error("Не удалось определить пользователя");
        }

        const profile = await fetchUserById(resolvedId, resolvedToken);
        if (cancelled) return;
        setUser(profile);
        setDirty(false);
      } catch (error: unknown) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : null;
        setError(message || "Не удалось загрузить профиль");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [authUser?.id, authToken]);

  const handleCardUpdate = (changes: Partial<ApiUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated: ApiUser = {
        ...prev,
        ...changes,
        describeUser:
          changes.describeUser !== undefined
            ? changes.describeUser.trim()
            : prev.describeUser,
        bio:
          changes.describeUser !== undefined
            ? changes.describeUser.trim()
            : prev.bio,
        skills: changes.skills ?? prev.skills,
        interests: changes.interests ?? prev.interests,
        hobbies: changes.hobbies ?? prev.hobbies,
      };
      return updated;
    });
    setDirty(true);
    setError(null);
    setSuccess(null);
  };

  const resolvedToken = useMemo(() => {
    if (authToken) return authToken;
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("token") ?? undefined;
    }
    return undefined;
  }, [authToken]);

  const handleSave = async () => {
    if (!user) return;
    const token = resolvedToken;
    if (!token) {
      setError("Требуется повторно войти в систему");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const login = user.login || authUser?.login || "";
      if (!login) {
        throw new Error("Не удалось определить логин пользователя");
      }
      const payload: UpdateUserPayload = {
        id: user.id,
        login,
        photoHash: user.photoHash ?? "",
        name: user.name,
        surName: user.surName ?? "",
        fatherName: user.fatherName ?? "",
        age: user.age ?? 0,
        gender: user.gender ?? "male",
        describeUser: user.describeUser ?? "",
        city: user.city ?? "",
        skills: user.skills ?? [],
        interests: user.interests ?? [],
        hobbies: user.hobbies ?? [],
      };

      const updated = await updateUserProfile(payload, token);
      setUser(updated);
      setDirty(false);
      setSuccess("Профиль обновлён");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : null;
      setError(message || "Не удалось сохранить профиль");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-gray-400 p-6">Загрузка профиля...</p>;
  }

  if (!user) {
    return (
      <div className="p-6 text-red-400">
        {error || "Профиль не найден"}
      </div>
    );
  }

  const getAnimation = (direction: string) => {
    switch (direction) {
      case "left":
        return { hidden: { x: -100, opacity: 0 }, visible: { x: 0, opacity: 1 } };
      case "right":
        return { hidden: { x: 100, opacity: 0 }, visible: { x: 0, opacity: 1 } };
      case "up":
        return { hidden: { y: -100, opacity: 0 }, visible: { y: 0, opacity: 1 } };
      case "down":
        return { hidden: { y: 100, opacity: 0 }, visible: { y: 0, opacity: 1 } };
      default:
        return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    }
  };

  const cards = [
    { variant: "info", span: "md:col-span-1", dir: "left" },
    { variant: "description", span: "md:col-span-2", dir: "right" },
    { variant: "skills", span: "md:col-span-2", dir: "up" },
    { variant: "photo", span: "md:col-span-1", dir: "down" },
  ] as const;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            className={`${card.span}`}
            initial="hidden"
            animate="visible"
            variants={getAnimation(card.dir)}
            transition={{ duration: 0.6, delay: i * 0.2, ease: "easeOut" }}
          >
            <UserCard
              user={user}
              variant={card.variant}
              onUpdate={handleCardUpdate}
            />
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          {error && <p className="text-sm text-red-400">{error}</p>}
          {!error && dirty && (
            <p className="text-sm text-yellow-400">Есть несохранённые изменения</p>
          )}
          {success && <p className="text-sm text-green-400">{success}</p>}
        </div>
        <Button onClick={handleSave} disabled={!dirty || saving}>
          {saving ? "Сохранение..." : "Сохранить изменения"}
        </Button>
      </div>
    </div>
  );
}
