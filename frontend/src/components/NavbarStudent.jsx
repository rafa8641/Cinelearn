import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import "../styles/NavbarStudent.css";
import logo from "../assets/logo.svg";
import defaultAvatar from "../assets/default-avatar.png";

export default function NavbarStudent() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Esconde busca nas páginas de detalhes
  const hideSearch = location.pathname.startsWith("/movie/");

  // Busca sincronizada com ?q=
  const [value, setValue] = useState(
    new URLSearchParams(location.search).get("q") || ""
  );

  // Atualiza input ao mudar de página
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    setValue(q);
  }, [location.search]);

  // Atualiza a URL (debounce)
  useEffect(() => {
    if (hideSearch) return;
    if (!location.pathname.startsWith("/student-home")) return;

    const t = setTimeout(() => {
      const params = new URLSearchParams(location.search);
      if (value) params.set("q", value);
      else params.delete("q");

      navigate(`/student-home?${params.toString()}`, { replace: true });
    }, 300);

    return () => clearTimeout(t);
  }, [value, hideSearch, location.pathname, location.search, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // ✅ garante que sempre tenha uma imagem válida
  const photoUrl =
    user?.photo && user.photo.trim() !== "" ? user.photo : defaultAvatar;

  return (
    <nav className="navbar-student">
      <div className="navbar-left">
        <Link to="/student-home" className="navbar-logo">
          <img src={logo} alt="CineLearn" />
        </Link>

        {!hideSearch && (
          <input
            type="text"
            placeholder="Buscar filmes..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="navbar-search"
          />
        )}
      </div>

      <div className="navbar-right">
        <Link to="/quiz" className="navbar-link">Quiz</Link>
        <div className="navbar-profile">
          <Link to="/profile" title="Ver Perfil">
            <img
              src={photoUrl}
              alt="Perfil"
              className="navbar-avatar"
              onError={(e) => (e.currentTarget.src = defaultAvatar)}
            />
          </Link>
          <button onClick={handleLogout} className="navbar-logout">
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
