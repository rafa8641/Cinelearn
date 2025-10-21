import express from "express";
import { registerUser, loginUser } from "../controllers/userController.js";
import User from "../models/Users.js";

const router = express.Router();

// ======================
// 🧍 Registro e Login
// ======================
router.post("/register", registerUser);
router.post("/login", loginUser);

// ======================
// 🧠 Atualizar perfil (foto, nome, etc.)
// ======================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, photo, age, role } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (photo) updateData.photo = photo;
    if (age) updateData.age = age;
    if (role) updateData.role = role;

    const user = await User.findByIdAndUpdate(id, updateData, { new: true });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(user);
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    res.status(500).json({ error: "Erro ao atualizar perfil" });
  }
});

export default router;
