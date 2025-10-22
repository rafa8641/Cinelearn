import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import MovieCard from "../components/MovieCard";
import { fetchMoviesWithFilters, fetchGenres } from "../services/moviesService";
import "../styles/StudentHome.css";

export default function StudentHome() {
  const { user, token } = useUser();
  const location = useLocation();

  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({ genre: "", type: "", year: "" });
  const [searchQuery, setSearchQuery] = useState(
    new URLSearchParams(location.search).get("q") || ""
  );

  // 🔁 controle de cursor
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Atualiza busca quando muda o ?q=
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    setSearchQuery(q);
  }, [location.search]);

  // Buscar gêneros
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

  // Carregar filmes iniciais
  useEffect(() => {
    if (!user || !user.age) return;
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
          maxAge: user.age,
          limit: 48,
          cursor: null,
        };

        const data = await fetchMoviesWithFilters(params);
        setMovies(data.movies || []);
        setCursor(data.nextCursor || null);
        setHasMore(Boolean(data.hasMore));
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("Erro ao carregar filmes");
        }
      } finally {
        setLoading(false);
      }
    }

    setCursor(null);
    setHasMore(true);
    setMovies([]);
    load();

    return () => controller.abort();
  }, [user, token, filters, searchQuery]);

  // Scroll infinito
  useEffect(() => {
    const handleScroll = async () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 200 >=
        document.documentElement.scrollHeight
      ) {
        if (!loadingMore && hasMore) {
          setLoadingMore(true);
          try {
            const params = {
              genre: filters.genre || "",
              type: filters.type || "",
              year: filters.year || "",
              q: searchQuery || "",
              maxAge: user.age,
              limit: 48,
              cursor,
            };

            const data = await fetchMoviesWithFilters(params);
            setMovies((prev) => [...prev, ...(data.movies || [])]);
            setCursor(data.nextCursor || null);
            setHasMore(Boolean(data.hasMore));
          } catch (err) {
            console.error(err);
          } finally {
            setLoadingMore(false);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [cursor, hasMore, loadingMore, user, filters, searchQuery]);

  return (
    <div className="student-home">
      <div className="student-content">
        <h2 className="student-title">Catálogo Educacional</h2>

        {/* 🎛️ Filtros */}
        <div className="filters">
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

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">Todos os Tipos</option>
            <option value="movie">Filme</option>
            <option value="tv">Série</option>
          </select>

          <input
            type="number"
            placeholder="Ano (ex: 2020)"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          />
        </div>

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

        {loadingMore && <p style={{ textAlign: "center" }}>Carregando mais...</p>}
      </div>
    </div>
  );
}
