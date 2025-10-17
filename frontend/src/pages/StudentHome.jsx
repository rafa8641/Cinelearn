import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import MovieCard from "../components/MovieCard";
import { fetchMovies } from "../services/moviesService";
import "../styles/StudentHome.css";

export default function StudentHome() {
  const { user, token } = useUser();
  const location = useLocation();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lê ?q= da URL
  const searchQuery = new URLSearchParams(location.search).get("q") || "";

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchMovies({
          maxAge: user.age,           // se quiser filtrar por idade
          q: searchQuery || undefined,
          token,
          signal: controller.signal,
        });
        setMovies(data.movies || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError(err.message || "Erro ao carregar filmes");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [user, token, searchQuery]);

  return (
    <div className="student-home">
      <div className="student-content">
        <h2 className="student-title">Recomendações para você 🎥</h2>

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
