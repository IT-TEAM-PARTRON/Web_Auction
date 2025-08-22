import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState(() => {
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (userInfo, remember) => {
    setUser(userInfo);
    if (remember) {
      localStorage.setItem("user", JSON.stringify(userInfo));
    } else {
      sessionStorage.setItem("user", JSON.stringify(userInfo));
    }
  };

  const logout = () => {
    setIsLoggingOut(true);
    setUser(null);
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    setTimeout(() => setIsLoggingOut(true), 100);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggingOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
