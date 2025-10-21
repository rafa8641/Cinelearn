import { useState } from "react";
import { loginUser } from "../services/authService";
import { useUser } from "../context/UserContext";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";

export default function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const { login } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(credentials);
      setMessage("Login realizado com sucesso!");
      login(data.user);
      if (data.user.role === "professor") {
        navigate("/teacher-home");
      } else {
        navigate("/student-home");
      }
    } catch (error) {
      setMessage("E-mail ou senha incorretos.");
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Entrar no CineLearn 🎥</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            onChange={handleChange}
            required
            className="login-input"
          />
          <input
            type="password"
            name="password"
            placeholder="Senha"
            onChange={handleChange}
            required
            className="login-input"
          />
          <button type="submit" className="login-button">
            Entrar
          </button>
        </form>
        {message && <p className="login-message">{message}</p>}
        <p className="login-register">
          Ainda não tem uma conta?{" "}
          <Link to="/register" className="login-link">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}