import "../styles/MovieCard.css";
import { Link } from "react-router-dom";

export default function MovieCard({ movie }) {
  // Garante que o caminho da imagem exista
  const posterUrl = movie.tmdbData?.poster_path
    ? `https://image.tmdb.org/t/p/w300${movie.tmdbData.poster_path}`
    : "https://via.placeholder.com/300x450?text=Sem+Imagem";

  // Sinopse resumida
  const overview =
    movie.tmdbData?.overview?.slice(0, 100) || "Sem descrição disponível.";

  // Gêneros (se existirem)
  const genres =
  movie.genres && movie.genres.length > 0
    ? movie.genres.map(g => g.name).join(", ")
    : "Gêneros não informados";

  return (
     <Link to={`/movie/${movie._id}`} style={{ textDecoration: "none" }}>
      <div className="movie-card">
        <img src={posterUrl} alt={movie.title} className="movie-poster" />
        <div className="movie-info">
          <h3>{movie.title}</h3>
          <p className="movie-overview">{overview}</p>
          <p className="movie-meta">
            <span>{movie.releaseYear}</span> •{" "}
            <span>{movie.rating ? `${movie.rating}+` : "Livre"}</span>
          </p>
          <p className="movie-genres">{genres}</p>
        </div>
      </div>
    </Link>
  );
}