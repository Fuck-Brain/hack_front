export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  await new Promise((r) => setTimeout(r, 400));
  return { id: "u1", name: email.split("@")[0] || "User", email };
}

export async function signup({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}) {
  await new Promise((r) => setTimeout(r, 600));
  return { id: "u2", name: name || email.split("@")[0] || "User", email };
}
