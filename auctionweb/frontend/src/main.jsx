import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { TetModeProvider } from "./contexts/TetModeContext";
import "./styles/global.css";
import './i18n';

ReactDOM.createRoot(document.getElementById("root")).render(
    <BrowserRouter>
      <AuthProvider>
        <TetModeProvider>
          <App />
        </TetModeProvider>
      </AuthProvider>
    </BrowserRouter>
);
