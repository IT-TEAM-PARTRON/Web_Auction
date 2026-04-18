import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import NavBar from "./NavBar";
import VoidBidWarningModal from "./VoidBidWarningModal";
import AuthModal from "./AuthModal";
import { useTetMode } from "../../contexts/TetModeContext";

const MainLayout = () => {
  const { tetMode } = useTetMode();
  
  return (
    <div 
      className="min-h-screen transition-colors duration-500"
      style={tetMode ? { backgroundColor: '#242526' } : {}}
    >
      <Header />
      <NavBar />
      <main className="md:px-4 max-w-[1800px] mx-auto p-5">
        <Outlet />
      </main>
      <Footer />
      <VoidBidWarningModal />
      <AuthModal />
    </div>
  );
};

export default MainLayout;

