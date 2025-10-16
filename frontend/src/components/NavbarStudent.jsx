import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "../styles/NavbarStudent.css";
import logo from "../assets/logo.svg";
import defaultAvatar from "../assets/default-avatar.png";

export default function NavbarStudent({ searchQuery, setSearchQuery }) {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar-student">
      <div className="navbar-left">
        <Link to="/student-home" className="navbar-logo">
          <img src={logo} alt="CineLearn" />
        </Link>

        <input
          type="text"
          placeholder="Buscar filmes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="navbar-search"
        />
      </div>

      <div className="navbar-right">
        <Link to="/quiz" className="navbar-link">Quiz</Link>
        <div className="navbar-profile">
          <img
            src={user?.photo || defaultAvatar}
            alt="Perfil"
            className="navbar-avatar"
          />
          <button onClick={handleLogout} className="navbar-logout">Sair</button>
        </div>
      </div>
    </nav>
  );
}
