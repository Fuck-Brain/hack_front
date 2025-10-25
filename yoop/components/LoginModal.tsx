"use client";

import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { loginApi, type LoginInput } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginModal() {
  const { loginOpen, closeLogin } = useAuthStore();
  const router = useRouter();
  const params = useSearchParams();
  const { loginSuccess } = useAuthStore.getState();
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const a = params.get("auth");
    if (a === "login") useAuthStore.getState().openLogin();
  }, [params]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>();

  const onSubmit = async (values: LoginInput) => {
    setServerError(null);
    try {
      const token = await loginApi(values);
      localStorage.setItem("token", token);
      loginSuccess({ id: "me", login: values.login, name: values.login }, token);
      reset();
      closeLogin();
      router.replace("/");
    } catch (e: any) {
      setServerError(e.message || "Ошибка авторизации");
    }
  };

  return (
    <Dialog open={loginOpen} onOpenChange={(o) => !o && closeLogin()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Вход в аккаунт</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label>Логин</Label>
            <Input {...register("login", { required: "Введите логин" })} />
            {errors.login && <p className="text-sm text-red-400">{errors.login.message}</p>}
          </div>

          <div>
            <Label>Пароль</Label>
            <Input type="password" {...register("password", { required: "Введите пароль" })} />
            {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
          </div>

          {serverError && <p className="text-red-400 text-sm">{serverError}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={closeLogin}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Вход..." : "Войти"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
