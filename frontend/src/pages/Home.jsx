import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "../styles/Home.css";

export default function Home() {
  const { user } = useUser();

  return (
    <div className="home-container">
      <div className="home-overlay">

        <main className="home-content">
          <h1 className="home-title">
            Bem-vindo ao <span className="highlight">CineLearn</span> 🎬
          </h1>
          <p className="home-subtitle">
            Explore filmes e séries educativos para inspirar o aprendizado de crianças e adolescentes.
          </p>

          <div className="home-buttons">
            {!user ? (
              <>
                <Link to="/login" className="home-btn primary">Entrar</Link>
                <Link to="/register" className="home-btn secondary">Cadastrar</Link>
              </>
            ) : (
              <Link
                to={user.role === "aluno" ? "/student-home" : "/teacher-home"}
                className="home-btn primary"
              >
                Ir para minha página
              </Link>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}