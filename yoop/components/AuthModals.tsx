"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { login, signup } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AuthModals() {
  const { loginOpen, signupOpen, closeLogin, closeSignup, setAuthed } =
    useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const a = params.get("auth");
    if (a === "login") useAuthStore.getState().openLogin();
    if (a === "signup") useAuthStore.getState().openSignup();
  }, [params]);

  const onLogin = async () => {
    const user = await login({ email, password });
    setAuthed(true, user);
    closeLogin();
    setEmail("");
    setPassword("");
    router.replace("/");
  };

  const onSignup = async () => {
    const user = await signup({ email, password, name });
    setAuthed(true, user);
    closeSignup();
    setEmail("");
    setPassword("");
    setName("");
    router.replace("/");
  };

  return (
    <>
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
            <p className="text-sm text-neutral-600">
              Нет аккаунта?{" "}
              <button
                onClick={() => {
                  closeLogin();
                  useAuthStore.getState().openSignup();
                }}
                className="underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={signupOpen} onOpenChange={(o) => !o && closeSignup()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign up</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="signup-name">Имя</Label>
              <Input
                id="signup-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="signup-pass">Пароль</Label>
              <Input
                id="signup-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button onClick={onSignup} className="w-full">
              Создать аккаунт
            </Button>
            <p className="text-sm text-neutral-600">
              Уже есть аккаунт?{" "}
              <button
                onClick={() => {
                  closeSignup();
                  useAuthStore.getState().openLogin();
                }}
                className="underline"
              >
                Log in
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
