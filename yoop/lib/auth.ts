// управляет сетевыми вызовами (валидация, статусы, JWT).
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

function ensureBase() {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_BASE не задан в .env.local");
}

export type LoginInput = { login: string; password: string };

export type SignupInput = {
  login: string;
  password: string;
  password2: string;
  name: string;
  surName: string;
  fatherName: string;
  age: number;
  gender: "male" | "female" | "helicopter";
  city: string;
  contact: string;
  photoHash?: string;
};

export type AuthResponse = {
  userId: string;
  token: string;
};

export async function loginApi(data: LoginInput): Promise<AuthResponse> {
  ensureBase();
  const res = await fetch(`${API_BASE}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(data),
  });
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    if (res.status === 400) throw new Error("Неверный логин или пароль");
    throw new Error(`${res.status} ${text || "Ошибка авторизации"}`);
  }
  try {
    const payload = JSON.parse(text) as AuthResponse;
    if (!payload.userId || !payload.token) {
      throw new Error("Некорректный ответ сервера");
    }
    return payload;
  } catch {
    throw new Error("Не удалось прочитать ответ сервера");
  }
}

export async function signupApi(data: SignupInput): Promise<AuthResponse> {
  ensureBase();

  if (data.password !== data.password2) {
    throw new Error("Пароли не совпадают");
  }

  const payload = {
    login: data.login,
    password: data.password,
    photoHash: "",
    name: data.name,
    surName: data.surName,
    fatherName: data.fatherName,
    age: data.age,
    gender: data.gender,
    describeUser: null,
    skills: null,
    city: data.city,
    contact: data.contact,
  };

  const res = await fetch(`${API_BASE}/user/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  const text = await res.text().catch(() => "");
  if (res.status === 201) {
    try {
      const payload = JSON.parse(text) as AuthResponse;
      if (!payload.userId || !payload.token) {
        throw new Error("Некорректный ответ сервера");
      }
      return payload;
    } catch {
      throw new Error("Не удалось прочитать ответ сервера");
    }
  }
  if (res.status === 400) {
    throw new Error("Пользователь с таким логином уже существует");
  }
  throw new Error(`${res.status} ${text || "Ошибка регистрации"}`);
}
