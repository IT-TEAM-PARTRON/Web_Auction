import { createContext, useContext, useState, useEffect } from "react";

const TetModeContext = createContext();

export function TetModeProvider({ children }) {
  const [tetMode, setTetMode] = useState(() => {
    const saved = localStorage.getItem("tetMode");
    return saved !== null ? JSON.parse(saved) : true; // Mặc định bật
  });

  useEffect(() => {
    localStorage.setItem("tetMode", JSON.stringify(tetMode));
  }, [tetMode]);

  const toggleTetMode = () => setTetMode((prev) => !prev);

  return (
    <TetModeContext.Provider value={{ tetMode, toggleTetMode }}>
      {children}
    </TetModeContext.Provider>
  );
}

export function useTetMode() {
  const context = useContext(TetModeContext);
  if (!context) {
    throw new Error("useTetMode must be used within a TetModeProvider");
  }
  return context;
}
