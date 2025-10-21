import User from "../models/Users.js";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, age } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Usuário já cadastrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "aluno", // 🔹 garante valor padrão
      age
    });

    await user.save();

    // 🔹 Retorna apenas campos seguros
    res.status(201).json({
      message: "Usuário cadastrado com sucesso",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        favorites: user.favorites,
        quizResults: user.quizResults,
      },
    });
  } catch (err) {
    console.error("Erro no cadastro:", err);
    res.status(500).json({ message: "Erro no cadastro", error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Senha incorreta" });
    }

    // 🔹 Retorna dados seguros + role
    res.status(200).json({
      message: "Login bem-sucedido",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        favorites: user.favorites,
        quizResults: user.quizResults,
      },
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ message: "Erro no login", error: err.message });
  }
};
