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

const RAW_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "";
const BASE_URL = RAW_BASE_URL.endsWith("/")
  ? RAW_BASE_URL.slice(0, -1)
  : RAW_BASE_URL;

// общий
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const targetPath = path.startsWith("/") ? path : `/${path}`;
  const headers = new Headers(init.headers ?? {});

  if (init.body !== undefined && !(init.body instanceof FormData)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const res = await fetch(`${BASE_URL}${targetPath}`, {
    cache: "no-store",
    ...init,
    headers,
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

export type CreateRequestBody = {
  userId: string;
  name: string; // поле обязателно
  text: string; // промт
};

// Вариант ответа (может измениться)
export type ApiProfile = {
  id: string;
  name: string;
  age: number;
  city: string;
  bio: string;
  avatarUrl?: string | null;
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

export async function updateUserProfile(
  payload: UpdateUserPayload,
  token?: string
) {
  const user = await request<Partial<ApiUser>>("/user/update", {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return normaliseUser({ ...payload, ...user });
}

export async function apiCreateRequest(
  body: CreateRequestBody
): Promise<ApiProfile[]> {
  return request<ApiProfile[]>("/request/create", {
    method: "POST",
    body: JSON.stringify(body),
  });
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
    "Люблю путешествия и коa;kе",
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
  return request<ApiMatchUser[]>(`/user/${userId}/getMatches`, {
    method: "GET",
  });
}
