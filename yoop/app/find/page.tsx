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

  const onSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    const requestId = `req_${Date.now()}`;
    setSearchKey(requestId);
    setTimeout(() => setLoading(false), 300);
  };

  return (
    <div className="space-y-6 pb-28">
      {" "}
      {/* место под нижний бар */}
      <h1 className="text-2xl font-bold">Найти людей</h1>
      <div className="mt-4">
        <SearchCarousel
          prompt={prompt}
          requestKey={searchKey}
          loading={loading}
        />
      </div>
      <form
        onSubmit={onSearch}
        className="fixed left-1/2 bottom-6 z-20 w-[92vw] max-w-3xl -translate-x-1/2"
      >
        <div className="flex items-center gap-2 rounded-full border border-border bg-neutral-900/60 px-4 py-3 shadow-2xl backdrop-blur-md">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Prompt here"
            className="h-10 flex-1 border-none bg-transparent text-foreground placeholder:text-neutral-500 focus-visible:ring-0"
          />
          <Button
            type="submit"
            className="h-10 w-10 rounded-full bg-primary p-0 text-primary-foreground hover:opacity-90"
          >
            →
          </Button>
        </div>
      </form>
    </div>
  );
}
