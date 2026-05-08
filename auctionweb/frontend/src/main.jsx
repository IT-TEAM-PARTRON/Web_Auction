import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { TetModeProvider } from "./contexts/TetModeContext";
import './styles/global.css';
import { initI18n } from './i18n';

const root = ReactDOM.createRoot(document.getElementById("root"));

initI18n().then(() => {
    root.render(
        <BrowserRouter>
          <AuthProvider>
            <TetModeProvider>
              <App />
            </TetModeProvider>
          </AuthProvider>
        </BrowserRouter>
    );
});
