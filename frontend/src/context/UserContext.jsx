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
      value={{ user, token, loading, setUser: persistUser, updateUser, setToken, login, logout }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
