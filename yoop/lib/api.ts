// lib/api.ts

const API_DEBUG =
  process.env.NEXT_PUBLIC_API_DEBUG === "1" ||
  process.env.NEXT_PUBLIC_API_DEBUG === "true";

function redact(key: string, value: unknown) {
  const k = key.toLowerCase();
  if (
    k.includes("password") ||
    k.includes("token") ||
    k.includes("authorization") ||
    k.includes("hashpassword")
  ) {
    if (typeof value === "string") {
      if (value.length <= 8) return "***";
      return value.slice(0, 4) + "***" + value.slice(-4);
    }
    return "***";
  }
  return value;
}

function safeStringify(obj: unknown) {
  try {
    return JSON.stringify(obj, (key, value) => redact(key, value), 2);
  } catch {
    return String(obj);
  }
}

function snapshotStorage() {
  if (typeof window === "undefined") return { where: "server" as const };
  try {
    const token = window.localStorage.getItem("token");
    const userId = window.localStorage.getItem("userId");
    return {
      where: "client" as const,
      token: token ? redact("token", token) : null,
      userId: userId ?? null,
    };
  } catch {
    return { where: "client", token: null, userId: null };
  }
}

// универсальный логгер
function logRequestStage(stage: string, payload: Record<string, unknown>) {
  if (!API_DEBUG) return;
  // помогаем искать в консоли: единый префикс
  // eslint-disable-next-line no-console
  console.debug(`[api:${stage}]`, payload);
}

// =============== БАЗОВЫЙ HTTP-ХЕЛПЕР ===============
const RAW_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "";
export const BASE_URL = RAW_BASE_URL.endsWith("/")
  ? RAW_BASE_URL.slice(0, -1)
  : RAW_BASE_URL;
const USE_MOCKS =
  (process.env.NEXT_PUBLIC_USE_MOCKS ?? "").toLowerCase() === "true";
const DEFAULT_TIMEOUT_MS = 20000;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const target = path.startsWith("/") ? path : `/${path}`;
  const url = `${BASE_URL}${target}`;

  const headers = new Headers(init.headers ?? {});
  if (init.body !== undefined && !(init.body instanceof FormData)) {
    if (!headers.has("Content-Type"))
      headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  // timeout + abort
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  if (API_DEBUG) {
    // НЕ логируем пароль и т.п.; тело показываем только если это string
    const safeBody =
      typeof init.body === "string" && init.body.length < 2000
        ? init.body
        : "[[binary/large body]]";
    console.debug("[api:request] →", init.method ?? "GET", url, {
      headers: Object.fromEntries(headers.entries()),
      body: safeBody,
    });
  }

  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      ...init,
      headers,
      signal: controller.signal,
    });
    console.log(res);
  } catch (err) {
    clearTimeout(timeout);
    if (API_DEBUG) console.error("[api:network-error]", url, err);
    throw new Error(`NETWORK_ERROR ${String(err)}`);
  } finally {
    clearTimeout(timeout);
  }

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    let bodyText = "";
    try {
      bodyText = isJson ? JSON.stringify(await res.json()) : await res.text();
    } catch {
      /* ignore */
    }
    if (API_DEBUG) {
      console.error(
        "[api:request:!ok]",
        res.status,
        url,
        res,
        bodyText.slice(0, 2000)
      );
    }
    throw new Error(`${res.status} ${bodyText || "Request failed"}`);
  }

  // 204 / пустое тело — вернём {} как и раньше
  if (res.status === 204) {
    if (API_DEBUG) console.debug("[api:response] ← 204 No Content", url);
    return {} as T;
  }

  // пробуем JSON, иначе пробуем текст (на всякий)
  try {
    const data = isJson ? await res.json() : await res.text();
    if (API_DEBUG) {
      const preview =
        typeof data === "string"
          ? data.slice(0, 2000)
          : JSON.stringify(data).slice(0, 2000);
      console.debug("[api:response] ←", res.status, url, preview);
    }
    return (data ?? {}) as T;
  } catch (e) {
    if (API_DEBUG) console.warn("[api:response:parse-fallback]", url, e);
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

export async function apiCreateRequest(
  body: CreateRequestBody
): Promise<string> {
  const path = "/request/create";
  console.log("[api] → POST", path, body);

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json", Accept: "*/*" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[api] ←", res.status, text);
    throw new Error(`${res.status} ${text || "Request failed"}`);
  }

  // Пытаемся корректно вытащить id и из JSON, и из text/plain
  const ct = res.headers.get("content-type") || "";
  let id: string | null = null;

  if (ct.includes("application/json")) {
    const data = (await res.json()) as unknown;
    // сервер мог вернуть либо "uuid" (JSON-строка), либо объект
    if (typeof data === "string") id = data;
    else if (data && typeof data === "object" && "id" in (data as any)) {
      id = String((data as any).id);
    }
  } else {
    // text/plain или что-то ещё
    const text = (await res.text()).trim();
    // если вдруг пришло с кавычками — снимем
    id = text.replace(/^"|"$/g, "");
  }

  console.log("[api] ← requestId:", id);

  if (!id) {
    throw new Error("request/create returned empty id");
  }

  return id;
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
export async function apiGetUserRecommendationsByPost(params: {
  userId: string;
  requestId: string;
}): Promise<RecommendationUser[]> {
  // Жёсткая валидация, чтобы в логи попало сразу понятное сообщение
  if (!params?.userId || !params?.requestId) {
    console.error("[api] invalid params for recommendations:", params);
    throw new Error(
      "apiGetUserRecommendationsByPost: missing userId or requestId"
    );
  }

  console.log("[api] → POST /ml/getRecommendedUsers", params);

  const data = await request<RecommendationUser[]>("/ml/getRecommendedUsers", {
    method: "POST",
    body: JSON.stringify(params),
  });

  console.log(
    "[api] ← recommendations:",
    Array.isArray(data) ? data.length : "not array"
  );

  return data;
}

export type PollTick = {
  attempt: number;
  lastCount: number;
  at: number; // Date.now()
};

export async function waitForRecommendations(params: {
  userId: string;
  requestId: string;
  timeoutMs?: number; // default 60_000
  intervalMs?: number; // default 2_000
  log?: boolean; // лог в консоль
  onTick?: (t: PollTick) => void; // коллбэк в UI
}): Promise<RecommendationUser[]> {
  const {
    userId,
    requestId,
    timeoutMs = 60_000,
    intervalMs = 2_000,
    log = false,
    onTick,
  } = params;

  if (!userId || !requestId) {
    console.error("[poll] invalid params:", { userId, requestId });
    throw new Error("waitForRecommendations: userId/requestId is empty");
  }

  const started = Date.now();
  let attempt = 0;

  while (Date.now() - started < timeoutMs) {
    attempt++;
    try {
      if (log) console.log(`[poll] try #${attempt}…`);
      const list = await apiGetUserRecommendationsByPost({ userId, requestId });
      const count = Array.isArray(list) ? list.length : 0;

      onTick?.({ attempt, lastCount: count, at: Date.now() });

      if (count > 0) {
        if (log) console.log(`[poll] got ${count} users → stop`);
        return list;
      }

      if (log) console.log("[poll] empty list, wait & retry…");
    } catch (e) {
      console.warn("[poll] error:", e);
      onTick?.({ attempt, lastCount: -1, at: Date.now() });
      // продолжим до таймаута
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  if (log) console.log("[poll] timed out → stop");
  onTick?.({ attempt, lastCount: 0, at: Date.now() });
  return [];
}

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
// lib/api.ts
export async function apiLikeUser(
  fromUserId: string,
  toUserId: string
): Promise<void> {
  const url = `${BASE_URL}/api/user/${encodeURIComponent(fromUserId)}/like`;

  // 1-я попытка: text/plain (без кавычек)
  let res = await fetch(url, {
    method: "POST",
    cache: "no-store",
    headers: {
      Accept: "*/*",
      "Content-Type": "text/plain",
    },
    body: toUserId,
  });

  // Если сервер всё же ждёт JSON-строку (с кавычками) — ретраим
  if (!res.ok) {
    const text1 = await res.text().catch(() => "");
    console.warn("[apiLikeUser] text/plain failed:", res.status, text1);

    res = await fetch(url, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(toUserId),
    });
  }

  if (!res.ok) {
    const text2 = await res.text().catch(() => "");
    throw new Error(`[apiLikeUser] ${res.status} ${text2 || "Request failed"}`);
  }
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
export type HasLikeUser = {
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

export async function apiGetLiked(userId: string): Promise<HasLikeUser[]> {
  return request<LikedUser[]>(`/user/${encodeURIComponent(userId)}/getLiked`, {
    method: "GET",
  });
}
export async function apiHasLiked(userId: string): Promise<LikedUser[]> {
  return request<LikedUser[]>(`/user/${encodeURIComponent(userId)}/hasLiked`, {
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
// function rnd<T>(arr: T[]) {
//   return arr[Math.floor(Math.random() * arr.length)];
// }

// function genMockUser(i: number): ApiUser {
//   const names = [
//     "Алиса",
//     "Борис",
//     "Вика",
//     "Глеб",
//     "Диана",
//     "Егор",
//     "Жанна",
//     "Зоя",
//     "Кирилл",
//     "Лена",
//   ];
//   const cities = [
//     "Москва",
//     "СПб",
//     "Казань",
//     "Екатеринбург",
//     "Самара",
//     "Новосибирск",
//   ];
//   const desc = [
//     "Люблю путешествия и кофе",
//     "Фронтенд-разработчик, ищу вдохновение",
//     "Обожаю котиков и пробежки",
//     "Играю на гитаре, фанат рока",
//     "Пишу стихи и изучаю Python",
//   ];

//   return {
//     id: `u_${Date.now()}_${i}`,
//     login: `user_${i}`,
//     hashPassword: "",
//     photoHash: "",
//     name: rnd(names),
//     surName: "Тестов",
//     fatherName: "Тестович",
//     age: 20 + Math.floor(Math.random() * 15),
//     gender: "other",
//     describeUser: rnd(desc),
//     city: rnd(cities),
//     contact: "@test",
//     skills: [
//       { id: `s_${i}`, userId: `u_${i}`, skillName: "React", user: `u_${i}` },
//     ],
//     interests: [
//       { id: `i_${i}`, userId: `u_${i}`, interestName: "UI", user: `u_${i}` },
//     ],
//     hobbies: [
//       { id: `h_${i}`, userId: `u_${i}`, hobbyName: "Музыка", user: `u_${i}` },
//     ],
//     requests: [],
//   };
// }

// export async function fetchRandomUsers(limit = 10): Promise<ApiUser[]> {
//   if (USE_MOCKS) {
//     await new Promise((r) => setTimeout(r, 500));
//     return Array.from({ length: limit }).map((_, i) => genMockUser(i));
//   }
//   // TODO: когда появится реальный эндпоинт
//   return [];
// }

// export async function fetchUsersByPrompt(
//   prompt: string,
//   limit = 10
// ): Promise<ApiUser[]> {
//   if (USE_MOCKS) {
//     await new Promise((r) => setTimeout(r, 700));
//     return Array.from({ length: limit }).map((_, i) => genMockUser(i));
//   }
//   // В реальности у нас теперь flow через /user/request/create -> /result/getUserRecommendations/{id}
//   // Поэтому эту функцию в проде лучше не использовать.
//   return [];
// }

// =================================================
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
  const surnames = [
    "Иванова",
    "Петров",
    "Сидорова",
    "Смирнов",
    "Козлова",
    "Волков",
    "Новикова",
    "Морозов",
    "Федорова",
    "Лебедев",
  ];
  const cities = [
    "Москва",
    "СПб",
    "Казань",
    "Екатеринбург",
    "Самара",
    "Новосибирск",
    "Нижний Новгород",
    "Краснодар",
    "Челябинск",
    "Уфа",
  ];
  const descriptions = [
    "Фронтенд-разработчик, люблю React и современный UI/UX дизайн",
    "Backend-инженер, фанат чистой архитектуры и Python",
    "ML-энтузиаст, работаю с нейросетями и LLM",
    "UI/UX дизайнер, создаю красивые интерфейсы и пользовательский опыт",
    "Fullstack-разработчик, люблю решать сложные задачи",
    "DevOps инженер, автоматизирую процессы и инфраструктуру",
    "Мобильный разработчик, создаю приложения для iOS и Android",
    "Блокчейн-разработчик, работаю с Web3 технологиями",
    "Data Science специалист, анализирую данные и строю модели",
    "QA инженер, обеспечиваю качество продукта и автоматизацию тестирования",
  ];
  const skillsList = [
    ["React", "TypeScript", "Node.js", "MongoDB"],
    ["Python", "Django", "PostgreSQL", "Redis"],
    ["Python", "PyTorch", "TensorFlow", "NLP"],
    ["Figma", "Adobe XD", "Sketch", "User Research"],
    ["JavaScript", "React", "Next.js", "GraphQL"],
    ["Docker", "Kubernetes", "AWS", "Terraform"],
    ["Swift", "Kotlin", "Flutter", "React Native"],
    ["Solidity", "Web3.js", "Ethereum", "Smart Contracts"],
    ["Python", "Pandas", "Scikit-learn", "Jupyter"],
    ["Selenium", "Cypress", "JMeter", "Postman"],
  ];
  const interestsList = [
    ["UI/UX", "Дизайн", "Анимации"],
    ["Backend", "Базы данных", "API"],
    ["ML", "LLM", "Нейросети"],
    ["Дизайн", "UX Research", "Прототипирование"],
    ["Fullstack", "Web Development", "Паттерны проектирования"],
    ["DevOps", "CI/CD", "Контейнеризация"],
    ["Мобильная разработка", "iOS", "Android"],
    ["Blockchain", "Web3", "DeFi"],
    ["Data Science", "Аналитика", "Визуализация данных"],
    ["Тестирование", "Автоматизация", "Качество кода"],
  ];
  const hobbiesList = [
    ["Фотография", "Путешествия", "Йога"],
    ["Гитара", "Футбол", "Шахматы"],
    ["Чтение", "Бег", "Кофе"],
    ["Рисование", "Веб-дизайн", "Спорт"],
    ["Видеоигры", "Музыка", "Кампинг"],
    ["Горный туризм", "Велоспорт", "Кайтсерфинг"],
    ["Скалолазание", "Танцы", "Настольные игры"],
    ["Криптовалюты", "Технологии", "Новости"],
    ["Статистика", "Математика", "Исследования"],
    ["Пасьянс", "Тестирование", "Оптимизация"],
  ];

  const gender = i % 2 === 0 ? "female" : "male";
  const idx = i % names.length;

  return {
    id: `u_mock_${i}_${Date.now()}`,
    login: `user_${i}`,
    hashPassword: "",
    photoHash: "",
    name: names[idx],
    surName: surnames[idx],
    fatherName: gender === "female" ? "Сергеевна" : "Сергеевич",
    age: 22 + Math.floor(Math.random() * 13),
    gender: gender,
    describeUser: descriptions[i % descriptions.length],
    city: cities[i % cities.length],
    contact: `@user_${i}`,
    skills: skillsList[i % skillsList.length].map((s, idx) => ({
      id: `skill_${i}_${idx}`,
      userId: `u_${i}`,
      skillName: s,
      user: `u_${i}`,
    })),
    interests: interestsList[i % interestsList.length].map((s, idx) => ({
      id: `interest_${i}_${idx}`,
      userId: `u_${i}`,
      interestName: s,
      user: `u_${i}`,
    })),
    hobbies: hobbiesList[i % hobbiesList.length].map((s, idx) => ({
      id: `hobby_${i}_${idx}`,
      userId: `u_${i}`,
      hobbyName: s,
      user: `u_${i}`,
    })),
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
