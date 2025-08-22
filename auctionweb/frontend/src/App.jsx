import { Routes, Route } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import Login from "./components/layout/Login";
import Register from "./components/layout/Register";
import ForgotPassword from "./components/layout/ForgotPassword.jsx";
import AuctionDetail from "./components/layout/AuctionDetail";
import CreateAuctionForm from "./components/layout/AuctionCreate.jsx";
import AuctionSearch from "./components/layout/AuctionSearch.jsx";
import MainLayout from "./components/layout/MainLayout.jsx";
import OverViewAdmin from "./Pages/OverViewAdmin.jsx";
import Rule from "./components/layout/Rule.jsx";
import Tutorial from "./components/layout/Tutorial.jsx";
import Contact from "./components/layout/Contact.jsx";
import History from "./components/layout/History.jsx";
import Information from "./components/layout/Information.jsx";
import PrivateRoute from "./components/layout/PrivateRoute.jsx";
import { Toaster } from "react-hot-toast";
import ResetPassword from "./components/layout/ResetPassword.jsx";
import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
function App() {
  const { t, i18n } = useTranslation();
  useEffect(() => {
  const savedLang = sessionStorage.getItem("lang") || "en";
  if (savedLang !== i18n.language) {
    i18n.changeLanguage(savedLang);
  }
}, []);

  return (
    <>
      <Toaster position="top-center" reverseOrder={true} />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/auctions/:id" element={<AuctionDetail />} />
          <Route path="/auctions/create" element={<CreateAuctionForm />} />
          <Route path="/auctions/search" element={<AuctionSearch />} />
          <Route element={<PrivateRoute />}>
            <Route path="/admin" element={<OverViewAdmin />} />
          </Route>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<Information />} />
          <Route path="/history" element={<History />} />
          <Route path="/policy" element={<Rule />} />
          <Route path="/guide" element={<Tutorial />} />
          <Route path="/contact" element={<Contact />} />
          
        </Route>
        {/* Not use layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
      
    </>
    
  );
}

export default App;
