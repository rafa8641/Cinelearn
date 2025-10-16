import { useState } from "react";
import { registerUser } from "../services/authService";

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
    console.log("📤 Enviando dados:", userData); // 👈 debug seguro

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
    <div style={{ padding: "2rem" }}>
      <h2>Cadastro de Usuário 🎬</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", width: "300px" }}>
        <input type="text" name="name" placeholder="Nome" onChange={handleChange} required />
        <input type="email" name="email" placeholder="E-mail" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Senha" onChange={handleChange} required />
        
        <select name="role" onChange={handleChange}>
          <option value="aluno">Aluno</option>
          <option value="professor">Professor</option>
          <option value="pai">Pai</option>
        </select>

        <input type="number" name="age" placeholder="Idade" onChange={handleChange} required />

        <button type="submit" style={{ marginTop: "1rem" }}>Cadastrar</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
