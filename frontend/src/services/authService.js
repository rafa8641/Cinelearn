import { apiFetch } from "./api";

// LOGIN
export async function loginUser({ email, password }) {
  const res = await apiFetch("/api/users/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Login falhou: ${res.status} ${errText}`);
  }
  return res.json();
}

// REGISTER
export async function registerUser(userData) {
  const res = await apiFetch("/api/users/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Cadastro falhou: ${res.status} ${errText}`);
  }
  return res.json();
}
