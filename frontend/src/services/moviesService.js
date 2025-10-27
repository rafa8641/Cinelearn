const BASE_URL = import.meta.env.VITE_API_URL || "https://cinelearn.onrender.com";

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
    const BASE_URL = import.meta.env.VITE_API_URL || "https://cinelearn.onrender.com";
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

export async function fetchMoviesWithFilters(filters = {}) {
  try {
    const params = new URLSearchParams();

    if (filters.genre) params.append("genre", filters.genre);
    if (filters.type) params.append("type", filters.type);
    if (filters.year) params.append("year", filters.year);
    if (filters.q) params.append("q", filters.q);
    if (filters.minAge || filters.ageRating) params.append("minAge", filters.minAge || filters.ageRating);
    if (filters.maxAge) params.append("maxAge", filters.maxAge);
    if (filters.limit) params.append("limit", String(filters.limit));
    if (filters.cursor) params.append("cursor", String(filters.cursor)); // << usa tmdbData.id

    console.log("🎬 Filtros enviados ao backend (cursor TMDB):", Object.fromEntries(params));

    const res = await fetch(`https://cinelearn.onrender.com/api/movies/filter?${params.toString()}`);
    if (!res.ok) throw new Error("Erro ao buscar filmes com filtros");

    const data = await res.json(); // { movies, nextCursor, hasMore }
    if (!Array.isArray(data.movies)) return { movies: [], nextCursor: null, hasMore: false };
    return data;
  } catch (err) {
    console.error("❌ Erro em fetchMoviesWithFilters:", err);
    return { movies: [], nextCursor: null, hasMore: false };
  }
}

export async function fetchGenres() {
  try {
    const res = await fetch("https://cinelearn.onrender.com/api/movies/genres");
    if (!res.ok) throw new Error("Erro ao buscar gêneros");

    const data = await res.json();
    // Garante que funciona tanto se o backend retornar { genres: [] } quanto []
    return Array.isArray(data.genres) ? data.genres : data;
  } catch (err) {
    console.error("❌ Erro em fetchGenres:", err);
    return [];
  }
}