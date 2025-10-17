import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import NavbarStudent from "./components/NavbarStudent"; // se tiver esse componente
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Quiz from "./pages/Quiz";
import Favorites from "./pages/Favorites";
import MovieDetails from "./pages/MovieDetails";
import StudentHome from "./pages/StudentHome";
import TeacherHome from "./pages/TeacherHome";

export default function App() {
  const location = useLocation();

  // Define onde mostrar qual navbar
  const showStudentNavbar =
    location.pathname.startsWith("/student-home") ||
    location.pathname.startsWith("/movie/");

  return (
    <>
      {showStudentNavbar ? <NavbarStudent /> : <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/student-home" element={<StudentHome />} />
        <Route path="/teacher-home" element={<TeacherHome />} />
      </Routes>
    </>
  );
}
