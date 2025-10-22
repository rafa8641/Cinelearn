import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import MovieCard from "../components/MovieCard";
import { fetchMoviesWithFilters, fetchGenres } from "../services/moviesService";
import "../styles/StudentHome.css";

export default function StudentHome() {
  const { user, token } = useUser();
  const location = useLocation();
  const [searchResults, setSearchResults] = useState([]);

  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🎛️ Filtros
  const [filters, setFilters] = useState({
    genre: "",
    type: "",
    year: "",
  });

 // 🔎 Busca reativa: atualiza sempre que o ?q= mudar
  const [searchQuery, setSearchQuery] = useState(
    new URLSearchParams(location.search).get("q") || ""
  );

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    setSearchQuery(q);
  }, [location.search]);

  // 🔹 Buscar lista de gêneros do backend
  useEffect(() => {
    async function loadGenres() {
      try {
        const data = await fetchGenres();
        setGenres(data);
      } catch (err) {
        console.error("Erro ao buscar gêneros:", err);
      }
    }
    loadGenres();
  }, []);

  // 🔹 Buscar filmes com filtros
 useEffect(() => {
  // ⚠️ Só busca filmes se o usuário e a idade existirem
  if (!user || !user.age) {
    console.warn("⏳ Aguardando dados do usuário antes de carregar filmes...");
    return;
  }

  const controller = new AbortController();

  async function load() {
    setLoading(true);
    setError("");

    try {
      const params = {
        genre: filters.genre || "",
        type: filters.type || "",
        year: filters.year || "",
        q: searchQuery || "",
      };

      // ✅ Define corretamente o tipo de idade
      if (user.role?.toLowerCase() === "professor") {
        params.minAge = user.age;
      } else {
        params.maxAge = user.age;
      }

      console.log("🎒 Enviando filtros (corrigido):", params);

      const data = await fetchMoviesWithFilters(params);
      setMovies(data.movies || []);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(err);
        setError("Erro ao carregar filmes");
      }
    } finally {
      setLoading(false);
    }
  }

  load();
  return () => controller.abort();
}, [user, token, filters, searchQuery]);

  return (
    <div className="student-home">
      <div className="student-content">
        <h2 className="student-title">Catálogo Educacional</h2>

        {/* 🎛️ Filtros */}
        <div className="filters">
          {/* Gênero (agora dinâmico) */}
          <select
            value={filters.genre}
            onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
          >
            <option value="">Todos os Gêneros</option>
            {genres.map((genreObj, index) => {
              const name = genreObj.name || genreObj; // se vier string, usa direto
              return (
                <option key={genreObj.id || index} value={name}>
                  {name}
                </option>
              );
            })}
          </select>

          {/* Tipo (Filme/Série) */}
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">Todos os Tipos</option>
            <option value="movie">Filme</option>
            <option value="tv">Série</option>
          </select>

          {/* Ano */}
          <input
            type="number"
            placeholder="Ano (ex: 2020)"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          />
        </div>

        {/* Resultado */}
        {loading && <p>Carregando filmes...</p>}
        {error && <p style={{ color: "salmon" }}>{error}</p>}
        {!loading && !error && movies.length === 0 && (
          <p className="no-results">Nenhum filme encontrado 😕</p>
        )}

        <div className="movie-grid">
          {movies.map((movie) => (
            <MovieCard key={movie._id || movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </div>
  );
}