import { useUser } from "../context/UserContext";
import "../styles/Profile.css";
import defaultAvatar from "../assets/default-avatar.png";

export default function Profile() {
  const { user, updateUser } = useUser();

    const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Converte a imagem para Base64 (persistente)
    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64 = reader.result;
        updateUser({ photo: base64 });

        // Atualiza no localStorage também
        const savedUser = JSON.parse(localStorage.getItem("cinelearn_user") || "{}");
        savedUser.photo = base64;
        localStorage.setItem("cinelearn_user", JSON.stringify(savedUser));
    };
    reader.readAsDataURL(file);
    };

  const profilePhoto =
    user?.photo && user.photo.trim() !== "" ? user.photo : defaultAvatar;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-info">
          <label htmlFor="photo-upload" className="profile-photo">
            <img
              src={profilePhoto}
              alt="Perfil"
              onError={(e) => (e.currentTarget.src = defaultAvatar)}
            />
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              hidden
            />
          </label>

          <div className="profile-text">
            <h2>{user?.name || "Usuário"}</h2>
            <p>{user?.email || "email@exemplo.com"}</p>
            <button className="edit-btn">Editar Perfil</button>
          </div>
        </div>
      </div>

      <div className="favorites-section">
        <h3>Favoritos</h3>
        <div className="favorites-grid">
          {/* Aqui você renderiza os filmes salvos */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="favorite-placeholder" />
          ))}
        </div>
      </div>
    </div>
  );
}
