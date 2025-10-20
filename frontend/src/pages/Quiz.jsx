import { useState } from "react";
import { Link } from "react-router-dom";
import { fetchGraphRecommendations } from "../services/moviesService";
import { useUser } from "../context/UserContext";
import { quizConfig } from "../data/quizConfig";
import "../styles/Quiz.css";

export default function Quiz() {
  const { user, updateUser } = useUser();
  const [answers, setAnswers] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");

  const handleSelect = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!user?._id) {
      alert("Usuário não identificado!");
      return;
    }

    // verifica se todas foram respondidas
    const unanswered = quizConfig.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      alert("Por favor, responda todas as perguntas antes de continuar.");
      return;
    }

    try {
      setError("");
      setShowResults(false);

      // junta todas as respostas em um array de palavras-chave
      const selectedKeywords = Object.values(answers);

      // 🔹 1. Salva no backend e recebe o quiz populado
      const saveRes = await fetch(`http://localhost:5000/users/${user._id}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: "educacional",
          answers: selectedKeywords,
        }),
      });

      if (!saveRes.ok) throw new Error("Erro ao salvar quiz");
      const result = await saveRes.json();

      // 🔹 2. Atualiza o contexto do usuário com o novo histórico
      const refreshedUser = await fetch(`http://localhost:5000/users/${user._id}`).then((r) => r.json());
      updateUser(refreshedUser);

      // 🔹 3. Exibe os filmes retornados no próprio quiz
      setRecommendations(result.quiz.recommendations || []);
      setShowResults(true);

    } catch (err) {
      console.error("❌ Erro ao salvar quiz:", err);
      setError("Erro ao salvar ou buscar recomendações.");
    }
  };

  return (
    <div className="quiz-page">
      <h2>🎬 Quiz Educacional</h2>

      {error && <p style={{ color: "salmon" }}>{error}</p>}

      {/* perguntas */}
      <div className="quiz-questions">
        {quizConfig.map((q) => (
          <div key={q.id} className="quiz-question">
            <h3>{q.question}</h3>
            {q.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelect(q.id, opt.label)} // <-- usamos label aqui
                className={answers[q.id] === opt.label ? "selected" : ""}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} className="submit-btn">
        Ver Recomendações
      </button>

      {showResults && (
        <div className="quiz-results">
          <h3>🎥 Filmes Recomendados</h3>
          {recommendations.length > 0 ? (
            <div className="movie-grid">
              {recommendations.map((movie) => (
                <Link
                  key={movie._id}
                  to={`/movie/${movie._id}`}
                  className="movie-card"
                >
                  <img
                    src={
                      movie.tmdbData?.poster_path
                        ? `https://image.tmdb.org/t/p/w200${movie.tmdbData.poster_path}`
                        : "https://via.placeholder.com/200x300?text=Sem+Imagem"
                    }
                    alt={movie.title}
                  />
                  <p>{movie.title}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p>Nenhuma recomendação encontrada 😢</p>
          )}
        </div>
      )}
    </div>
  );
}
