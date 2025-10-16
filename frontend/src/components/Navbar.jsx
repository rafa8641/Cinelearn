import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import logo from "../assets/logo.svg";

export default function Navbar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-gradient-purple"
      style={{
        color: "white",
        padding: "15px",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
        <img src={logo} alt="CineLearn" style={{ height: "40px"}} />
        </Link>
      
      <div style={{ display: "flex", gap: "15px" }}>
        {!user ? (
          <>
            <Link to="/" style={{ color: "white", textDecoration: "none" }}>
              Início
            </Link>
            <Link to="/login" style={{ color: "white", textDecoration: "none" }}>
              Login
            </Link>
            <Link
              to="/register"
              style={{ color: "white", textDecoration: "none" }}
            >
              Cadastro
            </Link>
          </>
        ) : (
          <>
            <span>Olá, {user.name.split(" ")[0]} 👋</span>
            <Link
              to={user.role === "aluno" ? "/student-home" : "/teacher-home"}
              style={{ color: "white", textDecoration: "none" }}
            >
              Minha Página
            </Link>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "1px solid white",
                color: "white",
                cursor: "pointer",
                padding: "4px 8px",
              }}
            >
              Sair
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

