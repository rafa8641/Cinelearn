import User from "../models/Users.js";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, age } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Usuário já cadastrado" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword, role, age });
    await user.save();

    res.status(201).json({ message: "Usuário cadastrado com sucesso", user });
  } catch (err) {
    res.status(500).json({ message: "Erro no cadastro", error: err });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Senha incorreta" });

    res.status(200).json({ message: "Login bem-sucedido", user });
  } catch (err) {
    res.status(500).json({ message: "Erro no login", error: err });
  }
};
