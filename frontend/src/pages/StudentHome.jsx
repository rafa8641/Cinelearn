import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import NavbarStudent from "../components/NavbarStudent";
import MovieCard from "../components/MovieCard";
import { fetchMovies } from "../services/moviesService";
import "../styles/StudentHome.css";

export default function StudentHome() {
  const { user, token } = useUser(); // se no contexto tiver token, ótimo
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // pede ao backend filmes com idade <= user.age e query de busca
      const data = await fetchMovies({
        maxAge: user.age,
        q: searchQuery || undefined,
        token,
        signal: controller.signal,
      });
        // espera data.movies (ajuste se seu backend retorna diferente)
        setMovies(data.movies || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError(err.message || "Erro ao carregar filmes");
        }
      } finally {
        setLoading(false);
      }
    };

    // pequena debounce UI (opcional simples)
    const timer = setTimeout(() => load(), 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [user, searchQuery, token]);

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
