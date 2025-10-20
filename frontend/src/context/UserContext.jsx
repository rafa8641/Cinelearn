import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser  = localStorage.getItem("cinelearn_user");
    const savedToken = localStorage.getItem("cinelearn_token");
    if (savedUser)  setUser(JSON.parse(savedUser));
    if (savedToken) setToken(savedToken);
    setLoading(false);
  }, []);

  // 🔒 helper que SEMPRE persiste
  const persistUser = (u) => {
    setUser(u);
    localStorage.setItem("cinelearn_user", JSON.stringify(u));
  };

    // ✅ use isso para atualizar pedaços do user sem perder o resto
    const updateUser = (partial) => {
      setUser(prev => {
        const merged = { ...(prev || {}), ...partial };
        localStorage.setItem("cinelearn_user", JSON.stringify(merged));
        return merged;
      });
    };

    // Adiciona ou remove um filme dos favoritos
    const toggleFavorite = (movie) => {
      setUser((prev) => {
        if (!prev) return prev;
        const favorites = prev.favorites || [];

        // já está favoritado → remove
        const exists = favorites.find((f) => f._id === movie._id);
        const updatedFavorites = exists
          ? favorites.filter((f) => f._id !== movie._id)
          : [...favorites, movie];

        const updatedUser = { ...prev, favorites: updatedFavorites };
        localStorage.setItem("cinelearn_user", JSON.stringify(updatedUser));
        return updatedUser;
      });
    };

    // Verifica se o filme está favoritado
    const isFavorite = (movieId) => {
      return user?.favorites?.some((f) => f._id === movieId);
    };


      const login = (userData, tokenValue) => {
        persistUser(userData);
        if (tokenValue) {
          setToken(tokenValue);
          localStorage.setItem("cinelearn_token", tokenValue);
        }
      };

      const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("cinelearn_user");
        localStorage.removeItem("cinelearn_token");
      };

      return (
        <UserContext.Provider
          value={{ user, token, loading, setUser: persistUser, updateUser, setToken, login, logout, toggleFavorite, isFavorite }}
        >
          {children}
        </UserContext.Provider>
      );
};

export const useUser = () => useContext(UserContext);
