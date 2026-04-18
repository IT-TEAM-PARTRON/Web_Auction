import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState(() => {
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Auth modal state: { isOpen, mode: 'login' | 'register' | 'forgot-password' }
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: "login" });

  const openAuthModal = useCallback((mode = "login") => {
    setAuthModal({ isOpen: true, mode });
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
    setTimeout(() => {
      setAuthModal({ isOpen: false, mode: "login" });
    }, 350);
  }, []);

  const switchAuthModal = useCallback((mode) => {
    setAuthModal((prev) => ({ ...prev, mode }));
  }, []);

  const login = (userInfo, remember) => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
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
    setTimeout(() => {
      setIsLoggingOut(false);
    }, 300);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoggingOut,
        authModal,
        openAuthModal,
        closeAuthModal,
        switchAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
