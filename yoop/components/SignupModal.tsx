"use client";

import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { signupApi, type SignupInput } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SignupModal() {
  const { signupOpen, closeSignup, setAuthed } = useAuthStore();
  const { loginSuccess } = useAuthStore.getState();

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
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    defaultValues: {
      gender: "male",
      photoHash: "",
    },
  });

  const onSubmit = async (values: SignupInput) => {
    setServerError(null);

    if (values.password !== values.password2) {
      setError("password2", { type: "manual", message: "Пароли не совпадают" });
      return;
    }

    if (
      values.password.length < 8 ||
      !/[a-z]/.test(values.password) ||
      !/[A-Z]/.test(values.password)
    ) {
      setError("password", {
        type: "manual",
        message:
          "Пароль должен содержать ≥8 символов, строчную и заглавную буквы",
      });
      return;
    }

    try {
      const token = await signupApi(values);
      localStorage.setItem("token", token);
      loginSuccess(
        {
          id: "me",
          login: values.login,
          name: `${values.name} ${values.surName}`,
        },
        token
      );
      reset();
      closeSignup();
      router.replace("/");
    } catch (e: any) {
      setServerError(e.message || "Ошибка регистрации");
    }
  };

  return (
    <Dialog open={signupOpen} onOpenChange={(o) => !o && closeSignup()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Регистрация</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Логин*</Label>
              <Input {...register("login", { required: "Введите логин" })} />
              {errors.login && (
                <p className="text-red-400 text-sm">{errors.login.message}</p>
              )}
            </div>
            <div>
              <Label>Пароль*</Label>
              <Input
                type="password"
                {...register("password", { required: "Введите пароль" })}
              />
              {errors.password && (
                <p className="text-red-400 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div>
              <Label>Повтор пароля*</Label>
              <Input
                type="password"
                {...register("password2", { required: "Повторите пароль" })}
              />
              {errors.password2 && (
                <p className="text-red-400 text-sm">
                  {errors.password2.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Фамилия*</Label>
              <Input
                {...register("surName", { required: "Введите фамилию" })}
              />
            </div>
            <div>
              <Label>Имя*</Label>
              <Input {...register("name", { required: "Введите имя" })} />
            </div>
            <div>
              <Label>Отчество*</Label>
              <Input
                {...register("fatherName", { required: "Введите отчество" })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Возраст*</Label>
              <Input
                type="number"
                min={12}
                max={100}
                {...register("age", { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label>Пол*</Label>
              <select
                {...register("gender")}
                className="w-full h-10 rounded-md border border-border bg-background px-3"
              >
                <option value="male">male</option>
                <option value="female">female</option>
                <option value="helicopter">helicopter</option>
              </select>
            </div>
            <div>
              <Label>Город*</Label>
              <Input {...register("city", { required: "Введите город" })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Контакт*</Label>
              <Input
                {...register("contact", { required: "Введите контакт" })}
              />
            </div>
            <div>
              <Label>Фото (хэш)</Label>
              <Input
                {...register("photoHash")}
                placeholder="(пока пустая строка)"
              />
            </div>
          </div>

          {serverError && <p className="text-red-400 text-sm">{serverError}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={closeSignup}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Отправка..." : "Создать аккаунт"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
