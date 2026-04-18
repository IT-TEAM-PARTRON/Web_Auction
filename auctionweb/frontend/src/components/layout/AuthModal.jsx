import { useEffect } from "react";
import { X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTetMode } from "../../contexts/TetModeContext";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import ForgotPasswordModal from "./ForgotPasswordModal";

function AuthModal() {
  const { authModal, closeAuthModal } = useAuth();
  const { tetMode } = useTetMode();
  const { isOpen, mode } = authModal;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        closeAuthModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeAuthModal]);

  const renderContent = () => {
    switch (mode) {
      case "register":
        return <RegisterModal />;
      case "forgot-password":
        return <ForgotPasswordModal />;
      case "login":
      default:
        return <LoginModal />;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[2000] flex items-center justify-center transition-all duration-300 ${
        isOpen
          ? "visible opacity-100"
          : "invisible opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeAuthModal}
      />

      {/* Modal Panel */}
      <div
        className={`relative z-10 w-full max-w-md mx-4 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          tetMode
            ? "bg-[#242526] border border-[#3a3b3c]"
            : "bg-white"
        } ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className={`absolute top-4 right-4 z-20 p-1.5 rounded-full transition-all duration-200 ${
            tetMode
              ? "text-gray-400 hover:text-white hover:bg-[#3a3b3c]"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          }`}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Content wrapper with scroll */}
        <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
