// routes/movieRoutes.js
import express from "express";
import { getMovies, getMovieById } from "../controllers/movieController.js";

const router = express.Router();

router.get("/", getMovies);        // GET /api/movies
router.get("/:id", getMovieById);  // GET /api/movies/:id

export default router;
