"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


const REGISTER_PATH = `${process.env.NEXT_PUBLIC_API_BASE}/user/register`;

type FormValues = {
  login: string;
  password: string;
  password2: string;
  surName: string;    // Фамилия
  name: string;       // Имя
  fatherName: string; // Отчество
  age: number;
  gender: "male" | "female" | "helicopter";
  city: string;
  contact: string;
  photoHash?: string;
};

export default function SignupModal() {
  const { signupOpen, closeSignup, setAuthed } = useAuthStore();
  const router = useRouter();
  const params = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const a = params.get("auth");
    if (a === "signup") useAuthStore.getState().openSignup();
  }, [params]);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      gender: "male",
      photoHash: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);

    // подтверждение пароля
    if (values.password !== values.password2) {
      setError("password2", { type: "validate", message: "Пароли не совпадают" });
      return;
    }

    // базовая проверка пароля: ≥8, буквы a-z и A-Z
    const passOk =
      values.password.length >= 8 &&
      /[a-z]/.test(values.password) &&
      /[A-Z]/.test(values.password);
    if (!passOk) {
      setError("password", {
        type: "validate",
        message: "Минимум 8 символов, должны быть строчная и заглавная буквы",
      });
      return;
    }

    // формируем payload под бэк
    const payload = {
      login: values.login,
      password: values.password,
      photoHash: "",
      name: values.name,
      surName: values.surName,
      fatherName: values.fatherName,
      age: Number(values.age),
      gender: values.gender, // "male" | "female" | "helicopter"
      describeUser: null,
      skills: null,
      city: values.city,
      contact: values.contact,
    };

    try {
      const res = await fetch(REGISTER_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(payload),
      });

      const text = await res.text().catch(() => "");

      // 201: успешная регистрация, тело = JWT string
      if (res.status === 201) {
        const token = text.replace(/^"|"$/g, ""); // на случай JSON-строки
        // сохраним токен — потом будем использовать для авторизованных запросов
        try { localStorage.setItem("token", token); } catch {}
        // пометим юзера залогиненным локально
        setAuthed(true, {
          id: "me",
          name: `${values.name} ${values.surName}`,
          email: values.login,
        });
        reset();
        closeSignup();
        router.replace("/");
        return;
      }

      // 400: логин занят (покажем ошибку на поле login)
      if (res.status === 400) {
        setError("login", {
          type: "server",
          message: "Пользователь с таким логином уже существует",
        });
        return;
      }

      // иные ошибки — общий текст
      setServerError(`${res.status} ${text || "Ошибка регистрации"}`);
    } catch (e: any) {
      setServerError(e?.message || "Ошибка сети");
    }
  };

  return (
    <Dialog open={signupOpen} onOpenChange={(o) => !o && closeSignup()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Регистрация</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Логин + Пароль */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="login">Логин*</Label>
              <Input
                id="login"
                {...register("login", { required: "Обязательное поле" })}
              />
              {errors.login && (
                <p className="mt-1 text-sm text-red-400">{errors.login.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Пароль*</Label>
              <Input
                id="password"
                type="password"
                {...register("password", { required: "Обязательное поле" })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
              <p className="mt-1 text-xs text-neutral-500">
                Минимум 8 символов, строчная и заглавная буквы
              </p>
            </div>
            <div>
              <Label htmlFor="password2">Повтор пароля*</Label>
              <Input
                id="password2"
                type="password"
                {...register("password2", { required: "Подтвердите пароль" })}
              />
              {errors.password2 && (
                <p className="mt-1 text-sm text-red-400">{errors.password2.message}</p>
              )}
            </div>
          </div>

          {/* ФИО */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="surName">Фамилия*</Label>
              <Input
                id="surName"
                {...register("surName", { required: "Обязательное поле" })}
              />
              {errors.surName && (
                <p className="mt-1 text-sm text-red-400">{errors.surName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="name">Имя*</Label>
              <Input id="name" {...register("name", { required: "Обязательное поле" })} />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="fatherName">Отчество*</Label>
              <Input
                id="fatherName"
                {...register("fatherName", { required: "Обязательное поле" })}
              />
              {errors.fatherName && (
                <p className="mt-1 text-sm text-red-400">{errors.fatherName.message}</p>
              )}
            </div>
          </div>

          {/* Возраст + Пол + Город */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="age">Возраст* (12–100)</Label>
              <Input
                id="age"
                type="number"
                min={12}
                max={100}
                {...register("age", {
                  required: "Обязательное поле",
                  valueAsNumber: true,
                  min: { value: 12, message: "Не моложе 12" },
                  max: { value: 100, message: "Не старше 100" },
                })}
              />
              {errors.age && (
                <p className="mt-1 text-sm text-red-400">{errors.age.message as string}</p>
              )}
            </div>

            <div>
              <Label htmlFor="gender">Пол*</Label>
              <select
                id="gender"
                className="h-10 w-full rounded-md border border-border bg-background px-3"
                {...register("gender", { required: "Выберите пол" })}
              >
                <option value="male">male</option>
                <option value="female">female</option>
                <option value="helicopter">helicopter</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-400">{errors.gender.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="city">Город*</Label>
              <Input id="city" {...register("city", { required: "Обязательное поле" })} />
              {errors.city && (
                <p className="mt-1 text-sm text-red-400">{errors.city.message}</p>
              )}
            </div>
          </div>

          {/* Контакт  */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="contact">Как связаться*</Label>
              <Input
                id="contact"
                placeholder="Telegram, email…"
                {...register("contact", { required: "Обязательное поле" })}
              />
              {errors.contact && (
                <p className="mt-1 text-sm text-red-400">{errors.contact.message}</p>
              )}
            </div>
          </div>

          {serverError && (
            <p className="text-sm text-red-400">{serverError}</p>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-border"
              onClick={() => {
                reset();
                closeSignup();
              }}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground">
              {isSubmitting ? "Отправка..." : "Создать аккаунт"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
