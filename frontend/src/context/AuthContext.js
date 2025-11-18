import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Ошибка декодирования токена:", err);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const getAvatarKey = (username) => `userAvatar_${username}`;

  const loadUserFromStorage = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }

    const decoded = parseJwt(token);
    if (!decoded) {
      setUser(null);
      return;
    }

    const username = decoded.unique_name;
    const savedAvatar = localStorage.getItem(getAvatarKey(username)); // аватар конкретного пользователя

    setUser({
      id: decoded.nameid,
      email: decoded.email,
      username: username,
      role: decoded.role,
      avatar: savedAvatar || null,
    });
  };

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const updateUser = (newValues) => {
    setUser((prev) => {
      const updatedUser = { ...prev, ...newValues };
      if (newValues.avatar !== undefined && updatedUser.username) {
        localStorage.setItem(getAvatarKey(updatedUser.username), newValues.avatar);
      }
      return updatedUser;
    });
  };

  const login = (data) => {
    localStorage.setItem("token", data.token);
    loadUserFromStorage();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null); // аватар не удаляем, чтобы при следующем входе сохранился
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
