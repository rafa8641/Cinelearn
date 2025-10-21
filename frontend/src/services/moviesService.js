const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 🔹 Helper opcional para incluir token (se houver login)
function withAuth(headers = {}, token) {
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// 🔹 Buscar lista de filmes (com suporte ao Quiz)
export async function fetchMovies({ maxAge, q, signal, token } = {}) {
  try {
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
      console.error("Erro na requisição:", text);
      throw new Error(`Erro ao buscar filmes: ${res.status} ${text}`);
    }

    const data = await res.json();
    // Garante que o retorno seja sempre um array
    return Array.isArray(data.movies) ? data : { movies: [] };
  } catch (err) {
    console.error("❌ Erro em fetchMovies:", err);
    return { movies: [] };
  }
}

// 🔹 Buscar filme individual por ID
export async function fetchMovieById(id, { token } = {}) {
  try {
    const url = `${BASE_URL}/api/movies/${id}`;
    const res = await fetch(url, {
      method: "GET",
      headers: withAuth({ "Content-Type": "application/json" }, token),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Erro ao buscar filme: ${res.status} ${text}`);
    }

    return await res.json();
  } catch (err) {
    console.error("❌ Erro em fetchMovieById:", err);
    return null;
  }
}

// 🔹 Buscar recomendações por grafo (quiz final)
export async function fetchGraphRecommendations(userId) {
  try {
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const res = await fetch(`${BASE_URL}/api/recommendations/graph/${userId}`);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Erro ao buscar recomendações: ${res.status} ${text}`);
    }

    const data = await res.json();
    return data.recommendations || [];
  } catch (err) {
    console.error("❌ Erro em fetchGraphRecommendations:", err);
    return [];
  }
}

export async function fetchMoviesWithFilters(filters) {
  try {
    const params = new URLSearchParams(filters);
    const res = await fetch(`http://localhost:5000/api/movies/filter?${params.toString()}`);
    if (!res.ok) throw new Error("Erro ao buscar filmes");

    const data = await res.json();
    return Array.isArray(data.movies) ? data : { movies: [] };
  } catch (err) {
    console.error("❌ Erro em fetchMoviesWithFilters:", err);
    return { movies: [] };
  }
}

export async function fetchGenres() {
  try {
    const res = await fetch("http://localhost:5000/api/movies/genres");
    if (!res.ok) throw new Error("Erro ao buscar gêneros");

    const data = await res.json();
    // Garante que funciona tanto se o backend retornar { genres: [] } quanto []
    return Array.isArray(data.genres) ? data.genres : data;
  } catch (err) {
    console.error("❌ Erro em fetchGenres:", err);
    return [];
  }
}