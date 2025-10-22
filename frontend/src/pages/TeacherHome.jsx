import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import MovieCard from "../components/MovieCard";
import { fetchMoviesWithFilters, fetchGenres } from "../services/moviesService";
import "../styles/StudentHome.css";

export default function TeacherHome() {
  const { user, token } = useUser();
  const location = useLocation();

  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🎛️ Filtros
  const [filters, setFilters] = useState({
    genre: "",
    type: "",
    year: "",
    ageRating: "", // 🆕 novo filtro
  });

  // Lê ?q= da URL (mantém busca padrão)
  const searchQuery = new URLSearchParams(location.search).get("q") || "";

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
    if (!user) return;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");

      try {
        const params = {
          genre: filters.genre || "",
          type: filters.type || "",
          year: filters.year || "",
          minAge: filters.ageRating || "", // 🆕 filtro de classificação
          q: searchQuery || "",
        };

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
          {/* Gênero (dinâmico) */}
          <select
            value={filters.genre}
            onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
          >
            <option value="">Todos os Gêneros</option>
            {genres.map((genreObj, index) => {
              const name = genreObj.name || genreObj;
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

          {/* 🆕 Classificação Indicativa */}
          <select
            value={filters.ageRating}
            onChange={(e) =>
              setFilters({ ...filters, ageRating: e.target.value })
            }
          >
            <option value="">Todas as Classificações</option>
            <option value="0">Livre</option>
            <option value="10">A partir de 10 anos</option>
            <option value="12">A partir de 12 anos</option>
            <option value="14">A partir de 14 anos</option>
            <option value="16">A partir de 16 anos</option>
            <option value="18">A partir de 18 anos</option>
          </select>
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