const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function withAuth(headers = {}, token) {
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function fetchMovies({ maxAge, q, signal, token } = {}) {
  const params = new URLSearchParams();
  if (maxAge !== undefined) params.append("maxAge", String(maxAge));
  if (q) params.append("q", q);

  const url = `${BASE_URL}/api/recommendations?${params.toString()}`;

  const res = await fetch(url, {
    method: "GET",
    headers: withAuth({ "Content-Type": "application/json" }, token),
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro ao buscar filmes: ${res.status} ${text}`);
  }

  return res.json();
}
