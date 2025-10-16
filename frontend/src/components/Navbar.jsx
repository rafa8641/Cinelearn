import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import logo from "../assets/logo.svg";
import "../styles/Navbar.css";

export default function Navbar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // 🔒 Rotas onde a Navbar padrão NÃO deve aparecer
  const HIDE_ON = ["/student-home", "/teacher-home", "/quiz"];

  // cobre rotas exatas e futuras rotas filhas (ex: /student-home/detalhe)
  const shouldHide =
    HIDE_ON.some((p) => location.pathname === p || location.pathname.startsWith(p + "/"));

  if (shouldHide) return null; // 👈 não renderiza a Navbar aqui

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar bg-gradient-purple">
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="CineLearn" className="navbar-img" />
      </Link>

      <div className="navbar-links">
        {!user ? (
          <>
            <Link to="/" className="navbar-link">Início</Link>
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/register" className="navbar-link">Cadastro</Link>
          </>
        ) : (
          <>
            <span className="navbar-user">Olá, {user.name.split(" ")[0]} 👋</span>
            <Link
              to={user.role === "aluno" ? "/student-home" : "/teacher-home"}
              className="navbar-link"
            >
              Minha Página
            </Link>
            <button onClick={handleLogout} className="navbar-logout">Sair</button>
          </>
        )}
      </div>
    </nav>
  );
}
