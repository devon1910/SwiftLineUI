import React, { useState } from "react";
import { ArrowUpRight, Clock3, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import SignUp from "./SignUp";
import PasswordReset from "./PasswordReset";
import { useTheme } from "../../services/utils/useTheme"; // Import useTheme

const AuthForm = ({ setShowAuthModal }) => {
  const [activeTab, setActiveTab] = useState("login");
  const [resetPassword, setResetPassword] = useState(false);
  const { darkMode } = useTheme(); // Use the theme hook
  const navigate = useNavigate();

  const handleResetPassword = () => {
    setResetPassword(true);
    setActiveTab("login"); // Keep "Login" tab active visually
  };

  const handleBackToLogin = () => {
    setResetPassword(false);
  };

  const renderTabs = () => (
    <div className="flex relative border-b border-gray-200 dark:border-gray-700 mb-6">
      <button
        onClick={() => {
          setActiveTab("login");
          setResetPassword(false); // Reset password view if user clicks back to login tab
        }}
        className={`flex-1 py-3 px-4 text-center text-sm font-medium transition-colors duration-200
          ${darkMode ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"}
          ${
            activeTab === "login"
              ? "border-b-2 border-sage-500 dark:border-sage-400 text-sage-600 dark:text-sage-400"
              : ""
          }
        `}
      >
        Login
      </button>
      <button
        onClick={() => {
          setActiveTab("signup");
          setResetPassword(false); // Reset password view if user clicks signup tab
        }}
        className={`flex-1 py-3 px-4 text-center text-sm font-medium transition-colors duration-200
          ${darkMode ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"}
          ${
            activeTab === "signup"
              ? "border-b-2 border-sage-500 dark:border-sage-400 text-sage-600 dark:text-sage-400"
              : ""
          }
        `}
      >
        Sign Up
      </button>
      <button
        onClick={() => setShowAuthModal?.(null) ?? navigate("/")}
        className={`absolute top-0 right-0 p-2 rounded-full transition-colors duration-200
          ${darkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}
        `}
        aria-label="Close authentication modal"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );

  const renderContent = () => {
    if (resetPassword) {
      return <PasswordReset onBackToLogin={handleBackToLogin} darkMode={darkMode} />; // Pass darkMode
    }

    return activeTab === "login" ? (
      <Login onResetPassword={handleResetPassword} setShowAuthModal={setShowAuthModal} />
    ) : (
      <SignUp setShowAuthModal={setShowAuthModal} />
    );
  };

  return (
    <main className={`auth-page ${darkMode ? "auth-page--dark" : ""}`}>
      <section className="auth-page__intro" aria-label="SwiftLine introduction">
        <button type="button" className="auth-page__brand" onClick={() => navigate("/")}>
          the<span>Swift</span>line <ArrowUpRight size={16} aria-hidden="true" />
        </button>
        <div className="auth-page__copy">
          <p className="auth-page__eyebrow">Queue confidence</p>
          <h1>Arrive informed.<br /><em>Move freely.</em></h1>
          <p>See your place in line, keep your day moving, and get back when it is your turn.</p>
        </div>
        <div className="auth-page__proof">
          <span><Clock3 size={17} /> Live queue updates</span>
          <span><ShieldCheck size={17} /> Protected account access</span>
        </div>
      </section>
      <section className="auth-page__panel">
        <div className={`auth-card ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}>
          <p className="auth-card__eyebrow">Your SwiftLine account</p>
          <h2>{resetPassword ? "Reset your password" : activeTab === "login" ? "Welcome back" : "Join the line"}</h2>
          {renderTabs()}
          <div className="mt-4">{renderContent()}</div>
        </div>
      </section>
    </main>
  );
};

export default AuthForm;
