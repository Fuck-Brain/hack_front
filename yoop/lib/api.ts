// lib/api.ts
export type RegisterPayload = {
  login: string;
  password: string;
  photoHash?: string | null;
  name: string;
  surName: string;
  fatherName: string;
  age: number;
  gender: "male" | "female" | "other";
  describeUser?: string | null;
  skills?: string | null;
  city: string;
  contact?: string | null;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "";

// общий helper
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${text || "Request failed"}`);
  }
  try {
    return (await res.json()) as T;
  } catch {
    // бэк может вернуть 200 без тела
    return {} as T;
  }
}

export async function registerUser(payload: RegisterPayload) {
  return request<unknown>("/user/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type ApiUser = {
  id: string;
  login?: string;
  photoHash?: string | null;
  name: string;
  surName?: string;
  fatherName?: string;
  age?: number;
  gender?: string;
  describeUser?: string | null;
  city?: string;
  skills?: string[];
  interests?: string[];
  hobbies?: string[];
  bio?: string | null;
  avatarUrl?: string;
};

export type UpdateUserPayload = {
  id: string;
  login: string;
  photoHash: string;
  name: string;
  surName: string;
  fatherName: string;
  age: number;
  gender: string;
  describeUser: string;
  city: string;
  skills: string[];
  interests: string[];
  hobbies: string[];
};

function normaliseUser(user: Partial<ApiUser>): ApiUser {
  return {
    id: user.id ?? "",
    login: user.login ?? "",
    photoHash: user.photoHash ?? "",
    name: user.name ?? "",
    surName: user.surName ?? "",
    fatherName: user.fatherName ?? "",
    age: user.age ?? 0,
    gender: user.gender ?? "",
    describeUser: user.describeUser ?? user.bio ?? "",
    bio: user.bio ?? user.describeUser ?? "",
    city: user.city ?? "",
    skills: user.skills ?? [],
    interests: user.interests ?? [],
    hobbies: user.hobbies ?? [],
    avatarUrl: user.avatarUrl,
  };
}

export async function fetchUserById(id: string, token?: string) {
  const user = await request<ApiUser>(`/user/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return normaliseUser(user);
}

export async function updateUserProfile(payload: UpdateUserPayload, token?: string) {
  const user = await request<Partial<ApiUser>>("/user/update", {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return normaliseUser({ ...payload, ...user });
}

function randomName() {
  const names = [
    "Алиса",
    "Борис",
    "Вика",
    "Глеб",
    "Диана",
    "Егор",
    "Жанна",
    "Зоя",
    "Кирилл",
    "Лена",
  ];
  return names[Math.floor(Math.random() * names.length)];
}

function randomCity() {
  const cities = [
    "Москва",
    "СПб",
    "Казань",
    "Екатеринбург",
    "Самара",
    "Новосибирск",
  ];
  return cities[Math.floor(Math.random() * cities.length)];
}

function randomBio() {
  const bios = [
    "Люблю путешествия и кофе",
    "Фронтенд-разработчик, ищу вдохновение",
    "Обожаю котиков и утренние пробежки",
    "Играю на гитаре, фанат рока",
    "Пишу стихи и изучаю Python",
  ];
  return bios[Math.floor(Math.random() * bios.length)];
}

function generateUsers(n = 10): ApiUser[] {
  return Array.from({ length: n }).map((_, i) => {
    const bio = randomBio();
    return {
      id: `u${Date.now()}_${i}`,
      login: `user_${i}`,
      name: randomName(),
      surName: "",
      fatherName: "",
      age: 20 + Math.floor(Math.random() * 15),
      city: randomCity(),
      describeUser: bio,
      bio,
      skills: [],
      interests: [],
      hobbies: [],
      photoHash: "",
    } satisfies ApiUser;
  });
}

export async function fetchRandomUsers(limit = 10): Promise<ApiUser[]> {
  await new Promise((r) => setTimeout(r, 600)); // имитация задержки сети
  return generateUsers(limit);
}

export async function fetchUsersByPrompt(
  prompt: string,
  limit = 10
): Promise<ApiUser[]> {
  // пока промт игнорируется, возвращаем случайных пользователей
  await new Promise((r) => setTimeout(r, 800));
  return generateUsers(limit);
}

export async function swipeUser(
  targetId: string,
  op: "like" | "dislike",
  idemKey: string
) {
  console.log(`swipe ${op} user ${targetId} (${idemKey})`);
  await new Promise((r) => setTimeout(r, 300));
  return { ok: true };
}
