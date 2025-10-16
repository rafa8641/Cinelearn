import { useState } from "react";
import { loginUser } from "../services/authService";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

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
      login(data.user); // salva usuário no contexto
      // redireciona baseado no tipo de usuário
      if (data.user.role === "professor" || data.user.role === "pai") {
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
    <div style={{ padding: "2rem" }}>
      <h2>Entrar no CineLearn 🎥</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Senha"
          onChange={handleChange}
          required
        />
        <button type="submit">Entrar</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
