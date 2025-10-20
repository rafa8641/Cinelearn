import { useState } from "react";
import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";
import "../styles/Profile.css";

export default function Profile() {
  const { user, updateUser } = useUser();
  const [editing, setEditing] = useState(false);
  const [showAll, setShowAll] = useState(false); // 👈 controla ver mais/ver menos

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    age: user?.age || "",
    accountType: user?.accountType || "Aluno",
  });

  if (!user) {
    return (
      <div className="profile-page">
        <h2>Carregando informações do perfil...</h2>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    updateUser(formData);
    setEditing(false);
    alert("Perfil atualizado com sucesso!");
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      age: user.age || "",
      accountType: user.accountType || "Aluno",
    });
    setEditing(false);
  };

  const favorites = user?.favorites || [];
  const quizResults = user?.quizResults || [];

  // 🔹 mostra os 5 mais recentes por padrão
  const displayedQuizzes = showAll ? quizResults : quizResults.slice(-5);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-text">
            <h2>{editing ? "Editar Perfil" : "Meu Perfil"}</h2>

            {editing ? (
              <>
                <label>
                  Nome:
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Email:
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Idade:
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="1"
                  />
                </label>

                <label>
                  Tipo de Conta:
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleChange}
                  >
                    <option value="Aluno">Aluno</option>
                    <option value="Professor">Professor</option>
                  </select>
                </label>

                <div className="profile-buttons">
                  <button className="save-btn" onClick={handleSave}>
                    Salvar
                  </button>
                  <button className="cancel-btn" onClick={handleCancel}>
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <p><strong>Nome:</strong> {user.name || "Usuário"}</p>
                <p><strong>Email:</strong> {user.email || "email@exemplo.com"}</p>
                <p><strong>Idade:</strong> {user.age || "Não informada"}</p>
                <p><strong>Tipo de conta:</strong> {user.accountType || "Aluno"}</p>
                <button className="edit-btn" onClick={() => setEditing(true)}>
                  Editar Perfil
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 💜 Favoritos */}
      <div className="favorites-section">
        <h3>Favoritos 💜</h3>
        <div className="favorites-grid">
          {favorites.length > 0 ? (
            favorites.map((movie) => (
              <a
                key={movie._id}
                href={`/movie/${movie._id}`}
                className="favorite-card"
              >
                <img
                  src={
                    movie.tmdbData?.poster_path
                      ? `https://image.tmdb.org/t/p/w200${movie.tmdbData.poster_path}`
                      : "https://via.placeholder.com/200x300?text=Sem+Imagem"
                  }
                  alt={movie.title}
                  className="favorite-poster"
                />
                <p>{movie.title}</p>
              </a>
            ))
          ) : (
            <p>Nenhum filme favorito ainda 😢</p>
          )}
        </div>
      </div>

      {/* 🧩 Histórico de quizzes */}
      <div className="quiz-history-section">
        <h3>Histórico de Quizzes</h3>

        {quizResults.length > 0 ? (
          <div className="quiz-history-list">
            {displayedQuizzes
              .slice()
              .reverse()
              .map((quiz, index) => (
                <div key={index} className="quiz-history-card">
                  <p><strong>Quiz:</strong> {quiz.quizId || "Quiz Educacional"}</p>
                  <p>
                    <strong>Data:</strong>{" "}
                    {quiz.createdAt
                      ? new Date(quiz.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "Data não registrada"}
                  </p>
                  <p>
                    <strong>Palavras-chave:</strong>{" "}
                    {quiz.answers?.join(", ") || "Nenhuma palavra-chave"}
                  </p>

                  {/* 🎥 Filmes recomendados */}
                    {quiz.recommendations?.length > 0 && (
                      <div className="quiz-recommendations">
                        <h4>🎬 Filmes Recomendados</h4>
                        <div className="quiz-movie-grid">
                          {quiz.recommendations.map((movie) => (
                            <Link key={movie._id} to={`/movie/${movie._id}`} className="quiz-movie-card">
                              <img
                                src={`https://image.tmdb.org/t/p/w200${movie.tmdbData?.poster_path}`}
                                alt={movie.title}
                              />
                              <p>{movie.title}</p>
                            </Link>
                          ))}
                        </div>
                      </div>
                  )}
                </div>
              ))}

            {/* ⬇️ Botão ver mais / menos */}
            {quizResults.length > 5 && (
              <div className="show-more-container">
                <button
                  className="show-more-btn"
                  onClick={() => setShowAll((prev) => !prev)}
                >
                  {showAll ? "Ver menos" : "Ver todos"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <p>Nenhum quiz realizado ainda 📭</p>
        )}
      </div>
    </div>
  );
}
