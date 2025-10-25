// components/LoginModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { login } from "@/lib/auth"; // твой текущий mock-логин
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginModal() {
  const { loginOpen, closeLogin, setAuthed } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const a = params.get("auth");
    if (a === "login") useAuthStore.getState().openLogin();
  }, [params]);

  const onLogin = async () => {
    const user = await login({ email, password });
    setAuthed(true, user);
    closeLogin();
    setEmail("");
    setPassword("");
    router.replace("/");
  };

  return (
    <Dialog open={loginOpen} onOpenChange={(o) => !o && closeLogin()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log in</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="login-pass">Пароль</Label>
            <Input
              id="login-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button onClick={onLogin} className="w-full">
            Войти
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
