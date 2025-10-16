import { useState } from "react";
import { registerUser } from "../services/authService";
import { Link } from "react-router-dom";
import "../styles/Register.css";
import logo from "../assets/logo.svg";

export default function Register() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "aluno",
    age: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📤 Enviando dados:", userData);

    try {
      const response = await registerUser(userData);
      console.log("✅ Resposta do backend:", response);
      setMessage("Cadastro realizado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao cadastrar:", error);
      setMessage("Erro ao cadastrar usuário.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Crie sua conta 🎬</h2>

        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            name="name"
            placeholder="Nome completo"
            onChange={handleChange}
            required
            className="register-input"
          />
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            onChange={handleChange}
            required
            className="register-input"
          />
          <input
            type="password"
            name="password"
            placeholder="Senha"
            onChange={handleChange}
            required
            className="register-input"
          />

          <select
            name="role"
            onChange={handleChange}
            className="register-select"
          >
            <option value="aluno">Aluno</option>
            <option value="professor">Professor</option>
            <option value="pai">Pai</option>
          </select>

          <input
            type="number"
            name="age"
            placeholder="Idade"
            onChange={handleChange}
            required
            className="register-input"
          />

          <button type="submit" className="register-button">
            Cadastrar
          </button>
        </form>

        {message && <p className="register-message">{message}</p>}

        <p className="register-login">
          Já tem uma conta?{" "}
          <Link to="/login" className="register-link">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
