"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import UserCard from "@/components/UserProfile/UserCard";
import { ApiUser, fetchRandomUsers } from "@/lib/api";

export default function ProfilePage() {
  const [user, setUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    fetchRandomUsers(1).then(([u]) => setUser(u));
  }, []);

  if (!user) return <p className="text-gray-400 p-6">Загрузка профиля...</p>;

  const directions = ["left", "right", "up", "down"];
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
    { variant: "info", span: "col-span-1", dir: "left" },
    { variant: "description", span: "col-span-2", dir: "right" },
    { variant: "skills", span: "col-span-2", dir: "up" },
    { variant: "photo", span: "col-span-1", dir: "down" },
  ];

  return (
    <div className="grid grid-cols-3 grid-rows-2 gap-4 p-6 max-w-5xl mx-auto">
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
            variant={card.variant as any}
            onUpdate={(newText) => {
              setUser({ ...user, bio: newText });
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
