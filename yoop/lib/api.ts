export type ApiUser = {
  id: string;
  name: string;
  age: number;
  city: string;
  bio: string;
  avatarUrl?: string;
};

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
  return Array.from({ length: n }).map((_, i) => ({
    id: `u${Date.now()}_${i}`,
    name: randomName(),
    age: 20 + Math.floor(Math.random() * 15),
    city: randomCity(),
    bio: randomBio(),
  }));
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
