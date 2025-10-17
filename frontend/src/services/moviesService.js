// frontend/src/services/moviesService.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Helper opcional para incluir token
function withAuth(headers = {}, token) {
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// 🔹 Buscar lista de filmes
export async function fetchMovies({ maxAge, q, signal, token } = {}) {
  const params = new URLSearchParams();
  if (maxAge !== undefined) params.append("maxAge", String(maxAge));
  if (q) params.append("q", q);

  const url = `${BASE_URL}/api/movies?${params.toString()}`;

  const res = await fetch(url, {
    method: "GET",
    headers: withAuth({ "Content-Type": "application/json" }, token),
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro ao buscar filmes: ${res.status} ${text}`);
  }

  return res.json(); // deve retornar { movies: [...] }
}

// 🔹 Buscar filme individual por ID
export async function fetchMovieById(id, { token } = {}) {
  const url = `${BASE_URL}/api/movies/${id}`;
  const res = await fetch(url, {
    method: "GET",
    headers: withAuth({ "Content-Type": "application/json" }, token),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro ao buscar filme: ${res.status} ${text}`);
  }

  return res.json(); // deve retornar um único filme
}
