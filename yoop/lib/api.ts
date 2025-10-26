// lib/api.ts

// =============== БАЗОВЫЙ HTTP-ХЕЛПЕР ===============
const RAW_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "";
export const BASE_URL = RAW_BASE_URL.endsWith("/")
  ? RAW_BASE_URL.slice(0, -1)
  : RAW_BASE_URL;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const target = path.startsWith("/") ? path : `/${path}`;
  const headers = new Headers(init.headers ?? {});
  // JSON по умолчанию
  if (init.body !== undefined && !(init.body instanceof FormData)) {
    if (!headers.has("Content-Type"))
      headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  const res = await fetch(`${BASE_URL}${target}`, {
    cache: "no-store",
    ...init,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${text || "Request failed"}`);
  }

  // сервер может вернуть 200/201 без тела
  try {
    return (await res.json()) as T;
  } catch {
    return {} as T;
  }
}

// =============== ТИПЫ POD БЭКЕНД-СХЕМУ ===============
export type ApiSkill = {
  id: string;
  userId: string;
  skillName: string;
  user: string;
};
export type ApiInterest = {
  id: string;
  userId: string;
  interestName: string;
  user: string;
};
export type ApiHobby = {
  id: string;
  userId: string;
  hobbyName: string;
  user: string;
};

export type ApiUser = {
  id: string;
  login: string;
  hashPassword: string;
  photoHash: string;
  name: string;
  surName: string;
  fatherName: string;
  age: number;
  gender: string;
  describeUser: string;
  city: string;
  contact: string;
  skills: ApiSkill[];
  interests: ApiInterest[];
  requests: string[];
  hobbies: ApiHobby[];
};
export function getFullName(u: ApiUser) {
  const fio = [u.name, u.surName].filter(Boolean).join(" ").trim();
  return fio || u.login;
}

// Эти хелперы теперь просто отдают массивы как есть,
// сохраняем их имена, чтобы старые импорты не ломались.
export function skillsToStrings(u: ApiUser): string[] {
  const a = u.skills ?? [];
  return a
    .map((x: any) => (typeof x === "string" ? x : (x?.skillName ?? "")))
    .filter(Boolean);
}

export function interestsToStrings(u: ApiUser): string[] {
  const a = u.interests ?? [];
  return a
    .map((x: any) => (typeof x === "string" ? x : (x?.interestName ?? "")))
    .filter(Boolean);
}

export function hobbiesToStrings(u: ApiUser): string[] {
  const a = u.hobbies ?? [];
  return a
    .map((x: any) => (typeof x === "string" ? x : (x?.hobbyName ?? "")))
    .filter(Boolean);
}

// =============== AUTH ===============
export type RegisterPayload = {
  login: string;
  password: string;
  photoHash?: string | null;
  name: string;
  surName: string;
  fatherName: string;
  age: number;
  gender: string;
  describeUser?: string | null;
  skills?: string | null;
  city: string;
  contact?: string | null;
};

export type AuthResponse = {
  token: string;
  userId: string;
};

export async function registerUser(
  payload: RegisterPayload
): Promise<AuthResponse> {
  return request<AuthResponse>("/user/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type LoginPayload = { login: string; password: string };

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/user/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// =============== ПРОФИЛЬ ===============
export async function fetchUserById(id: string, token?: string) {
  return request<ApiUser>(`/user/${encodeURIComponent(id)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

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
  contact: string;
  skills: string[];
  interests: string[];
  hobbies: string[];
};

export async function updateUserProfile(
  payload: UpdateUserPayload,
  token?: string
) {
  return request<ApiUser>("/user/update", {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

// === ПОИСК ПО ПРОМПТУ (создание и получение результата) ===
export type CreateRequestBody = {
  userId: string;
  name: string; // по ТЗ можно "", но поле обязательно
  text: string;
};

export type CreateRequestResponse = { id: string };

// ВАЖНО: теперь create возвращает только id
export async function apiCreateRequest(
  body: CreateRequestBody
): Promise<string> {
  const res = await request<CreateRequestResponse>("/user/request/create", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.id;
}

// Ответ от /api/result/getUserRecommendations/{id}
// Обратите внимание: здесь skills/interests/hobbies — массивы СТРОК
export type RecommendationUser = {
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

// Получение рекомендаций по id запроса
export async function apiGetUserRecommendations(
  requestId: string
): Promise<RecommendationUser[]> {
  return request<RecommendationUser[]>(
    `/result/getUserRecommendations/${encodeURIComponent(requestId)}`,
    { method: "GET" }
  );
}

/**
 * Утилита: преобразовать RecommendationUser[] в наш общий ApiUser[],
 * если карусель/карточки у тебя ждут именно ApiUser.
 * (Собираем "плоские" строки в объекты, поле describeUser -> оставляем как есть)
 */
export function mapRecommendationsToApiUsers(
  list: RecommendationUser[]
): ApiUser[] {
  return list.map((u, i) => ({
    id: u.id,
    login: u.login,
    hashPassword: "", // сервер не присылает — заполняем пустым
    photoHash: u.photoHash ?? "",
    name: u.name,
    surName: u.surName,
    fatherName: u.fatherName,
    age: u.age,
    gender: u.gender,
    describeUser: u.describeUser,
    city: u.city,
    contact: "", // сервер не присылает в этом ответе
    // конвертируем массивы строк -> массивы объектов
    skills: (u.skills || []).map((s, idx) => ({
      id: `${u.id}_skill_${idx}`,
      userId: u.id,
      skillName: s,
      user: u.id,
    })),
    interests: (u.interests || []).map((s, idx) => ({
      id: `${u.id}_interest_${idx}`,
      userId: u.id,
      interestName: s,
      user: u.id,
    })),
    hobbies: (u.hobbies || []).map((s, idx) => ({
      id: `${u.id}_hobby_${idx}`,
      userId: u.id,
      hobbyName: s,
      user: u.id,
    })),
    requests: [],
  }));
}

// =============== ЛАЙК/МЭТЧИ/ИСТОРИИ ===============
export async function apiLikeUser(
  fromUserId: string,
  toUserId: string
): Promise<void> {
  await request<void>(`/user/${encodeURIComponent(fromUserId)}/like`, {
    method: "POST",
    body: JSON.stringify({ id: toUserId }),
  });
}
export async function apiDislikeUser(
  fromUserId: string,
  toUserId: string
): Promise<void> {
  await request<void>(`/user/${encodeURIComponent(fromUserId)}/dislike`, {
    method: "POST",
    body: JSON.stringify({ id: toUserId }),
  });
}

// История лайков (эндпоинт, который возвращает массив «плоских» полей)
export type LikedUser = {
  id: string;
  login: string;
  photoHash: string | null;
  name: string;
  surName: string;
  fatherName: string;
  age: number;
  gender: string;
  describeUser: string | null;
  city: string;
  skills: string[];
  interests: string[];
  hobbies: string[];
};

export async function apiGetLiked(userId: string): Promise<LikedUser[]> {
  return request<LikedUser[]>(`/user/${encodeURIComponent(userId)}/getLiked`, {
    method: "GET",
  });
}

export type ApiMatchUser = {
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

export async function apiGetMatches(userId: string): Promise<ApiMatchUser[]> {
  return request<ApiMatchUser[]>(
    `/user/${encodeURIComponent(userId)}/getMatches`,
    {
      method: "GET",
    }
  );
}

// =============== МОКИ ДЛЯ ЛОКАЛЬНОЙ ОТЛАДКИ UI ===============
function rnd<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function genMockUser(i: number): ApiUser {
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
  const cities = [
    "Москва",
    "СПб",
    "Казань",
    "Екатеринбург",
    "Самара",
    "Новосибирск",
  ];
  const desc = [
    "Люблю путешествия и кофе",
    "Фронтенд-разработчик, ищу вдохновение",
    "Обожаю котиков и пробежки",
    "Играю на гитаре, фанат рока",
    "Пишу стихи и изучаю Python",
  ];

  return {
    id: `u_${Date.now()}_${i}`,
    login: `user_${i}`,
    hashPassword: "",
    photoHash: "",
    name: rnd(names),
    surName: "Тестов",
    fatherName: "Тестович",
    age: 20 + Math.floor(Math.random() * 15),
    gender: "other",
    describeUser: rnd(desc),
    city: rnd(cities),
    contact: "@test",
    skills: [
      { id: `s_${i}`, userId: `u_${i}`, skillName: "React", user: `u_${i}` },
    ],
    interests: [
      { id: `i_${i}`, userId: `u_${i}`, interestName: "UI", user: `u_${i}` },
    ],
    hobbies: [
      { id: `h_${i}`, userId: `u_${i}`, hobbyName: "Музыка", user: `u_${i}` },
    ],
    requests: [],
  };
}

export async function fetchRandomUsers(limit = 10): Promise<ApiUser[]> {
  await new Promise((r) => setTimeout(r, 500));
  return Array.from({ length: limit }).map((_, i) => genMockUser(i));
}

export async function fetchUsersByPrompt(
  prompt: string,
  limit = 10
): Promise<ApiUser[]> {
  await new Promise((r) => setTimeout(r, 700));
  // пока промт игнорируем — возвращаем моки
  return Array.from({ length: limit }).map((_, i) => genMockUser(i));
}
