"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SearchCarousel from "@/components/SearchCarousel";

export default function FindPage() {
  const router = useRouter();
  const { isAuthed, openLogin } = useAuthStore();

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchKey, setSearchKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthed) {
      openLogin();
      router.push("/?auth=login");
    }
  }, [isAuthed, openLogin, router]);

  const onSearch = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const requestId = `req_${Date.now()}`; // ключ для обновления
    setSearchKey(requestId);
    // имитация ожидания бэка (в реале loading можно снять после fetch внутри компонента по событию)
    setTimeout(() => setLoading(false), 300);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Найти людей</h1>

      <div className="flex gap-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Опишите, кого ищете (например: React-разработчик из СПб)"
        />
        <Button onClick={onSearch}>Искать</Button>
      </div>

      <div className="mt-4">
        <SearchCarousel
          prompt={prompt}
          requestKey={searchKey}
          loading={loading}
        />
      </div>
    </div>
  );
}
