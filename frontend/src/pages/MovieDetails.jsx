import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchMovieById } from "../services/moviesService";
import "../styles/MovieDetails.css";

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchMovieById(id);
        setMovie(data);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar o filme");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    alert(
      !isFavorite
        ? `${movie.title} foi adicionado aos favoritos 💜`
        : `${movie.title} foi removido dos favoritos`
    );
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;
  if (!movie) return <p>Filme não encontrado.</p>;

  const posterUrl = movie.tmdbData?.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.tmdbData.poster_path}`
    : "https://via.placeholder.com/500x750?text=Sem+Imagem";

  const genres =
    movie.genres?.length > 0
      ? movie.genres.map((g) => g.name).join(", ")
      : "Gêneros não informados";

  const keywords =
    movie.keywords?.length > 0
      ? movie.keywords.map((k) => k.name).join(", ")
      : "Palavras-chave não informadas";

  return (
    <div className="movie-details-container">
      <div className="movie-details-informations">
      <div className="movie-poster-section">
        <img src={posterUrl} alt={movie.title} className="movie-poster-large" />
      </div>

      <div className="movie-info-section">
        <h1>{movie.title}</h1>
        <p className="movie-original-title">{movie.originalTitle}</p>
        <p className="movie-year">{movie.releaseYear || "Ano desconhecido"}</p>

       <div className="stars">
          {(() => {
            const tmdbRating = movie.tmdbData?.vote_average || 0;
            const starCount = tmdbRating / 2; // converte 0–10 para 0–5

            return [...Array(5)].map((_, i) => {
              const diff = starCount - i;
              let starClass = "star";

              if (diff >= 1) starClass += " full";
              else if (diff >= 0.5) starClass += " half";

              return <span key={i} className={starClass}>★</span>;
            });
          })()}

          <span className="numeric-rating">
            {(movie.tmdbData?.vote_average
              ? (movie.tmdbData.vote_average / 2).toFixed(1)
              : "N/A")}{" "}
            / 5
          </span>
        </div>
      
          <div className="movie-genres-fav">
            <p className="movie-genres">
              <strong>Gêneros:</strong>{" "}
                <p className="movie-genres-info">
              {movie.genres?.length > 0
                ? movie.genres.map((g) => g.name).join("  ")
                : "Não informados"}
                </p>
            </p>

            <button
              className={`favorite-button ${isFavorite ? "active" : ""}`}
              onClick={handleFavorite}
              title={isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
            >
              {isFavorite ? "♥" : "♡"}
            </button>
          </div>

        </div>

      </div>


        <div className="details-grid">
          <div>
            <h3>Descrição:</h3>
            <p>{movie.tmdbData?.overview || "Sem descrição disponível."}</p>
          </div>

          <div>
            <h3>Palavras Chaves:</h3>
            <p>
              {movie.keywords?.length > 0
                ? movie.keywords.map((k) => k.name).join(", ")
                : "Não informadas"}
            </p>
        </div>
      </div>

      </div>
  );
}
