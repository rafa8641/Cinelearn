import { OrbitProgress } from "react-loading-indicators";
import "@fontsource/poppins";

export default function LoadingScreen() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #6B21A8, #9333EA)",
        color: "#fff",
        fontFamily: '"Poppins", sans-serif',
      }}
    >
      <OrbitProgress variant="track-disc" color="#fff" size="medium" />
      <h2 style={{ marginTop: "20px", fontSize: "1.4rem" }}>
        Gerando suas recomendações...
      </h2>
      <p style={{ opacity: 0.8 }}>Aguarde alguns segundos 🍿</p>
    </div>
  );
}
