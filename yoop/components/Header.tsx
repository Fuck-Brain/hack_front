"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { museo } from "@/lib/fonts";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const router = useRouter();
  const { isAuthed, user, openLogin, openSignup, logout } = useAuthStore();

  const handleLogout = () => {
    // 1) чистим auth из стора (и токен, если это делает стор)
    logout();
    // 2) на всякий случай чистим токен здесь (если не делается в сторе)
    try {
      localStorage.removeItem("token");
    } catch {}
    // 3) уводим на главную и обновляем состояние
    router.replace("/");
    router.refresh();
  };

  const handleFindClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthed) {
      openLogin(); // показать попап логина
      return; // не навигируемся
    }
    router.push("/find"); // авторизован — идём на страницу
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Лого слева */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-90">
          <Image
            src="/logo.svg"
            alt="YooPeople"
            width={28}
            height={28}
            className="select-none"
            priority
          />
          <span
            className={`${museo.className} text-logo text-xl font-semibold tracking-wide`}
          >
            YooPeople
          </span>
        </Link>

        {/* Центр — навигация */}
        <nav className="hidden gap-4 md:flex">
          <Button
            asChild
            variant="ghost"
            className="cursor-pointer text-accent text-[16px] font-medium border-none bg-transparent hover:bg-transparent hover:bg-[color:var(--secondary)]"
          >
            <Link href="/">Главная</Link>
          </Button>

          <Button
            variant="ghost"
            onClick={handleFindClick}
            className="cursor-pointer text-accent text-[16px] font-medium border-none bg-transparent hover:bg-transparent hover:bg-[color:var(--secondary)]"
          >
            Найти людей
          </Button>
        </nav>

        {/* Право — Auth */}
        <div className="flex items-center gap-3">
          {!isAuthed ? (
            <>
              <Button
                variant="outline"
                onClick={openSignup}
                className="cursor-pointer border-border text-foreground hover:bg-[color:var(--secondary)]"
              >
                Sign up
              </Button>
              <Button
                onClick={openLogin}
                className="cursor-pointer bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[color:var(--foreground)]"
              >
                Log in
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 border-border cursor-pointer text-foreground hover:bg-[color:var(--secondary)]"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {(user?.name ?? user?.login ?? "U")
                        .slice(0, 1)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[140px] truncate">
                    {user?.name ?? user?.login ?? "User"}
                  </span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="min-w-48">
                <DropdownMenuLabel className="cursor-default">
                  Мой аккаунт
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer hover:bg-[color:var(--secondary)]"
                >
                  <Link href="/profile">Профиль</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer hover:bg-[color:var(--secondary)]"
                >
                  <Link href="/likes">История лайков</Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer hover:bg-[color:var(--secondary)]"
                >
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
