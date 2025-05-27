import React, { useState } from "react";
import Login from "./Login";
import SignUp from "./SignUp";
import PasswordReset from "./PasswordReset";

const AuthForm = ({ setShowAuthModal }) => {
  const [activeTab, setActiveTab] = useState("login");
  const [resetPassword, setResetPassword] = useState(false);

  const handleResetPassword = () => {
    setResetPassword(true);
    setActiveTab("login");
  };

  const handleBackToLogin = () => {
    setResetPassword(false);
  };

  const renderTabs = () => (
    <div className="auth-tabs flex">
      <button
        onClick={() => setActiveTab("login")}
        className={`auth-tab-button login ${activeTab === "login" ? "active" : ""}`}
      >
        Login
      </button>
      <button
        onClick={() => setActiveTab("signup")}
        className={`auth-tab-button signup ${activeTab === "signup" ? "active" : ""}`}
      >
        Sign Up
      </button>
      <button
        onClick={() => setShowAuthModal(null)}
        className="absolute top-[-8px] right-[-8px] md:top-[-12px] md:right-[-12px] rounded-full px-3 py-1 text-sm shadow-md hover:shadow-lg transition-shadow"
      >
        ×
      </button>
    </div>
  );

  const renderContent = () => {
    if (resetPassword) {
      return <PasswordReset onBackToLogin={handleBackToLogin} />;
    }

    return activeTab === "login" ? (
      <Login onResetPassword={handleResetPassword} setShowAuthModal={setShowAuthModal} />
    ) : (
      <SignUp setShowAuthModal={setShowAuthModal} />
    );
  };

  return (
    <div className="w-full max-w-md auth-card rounded-xl overflow-hidden">
      <div className="p-4 md:p-6">
        {renderTabs()}
        <div className="auth-content">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AuthForm;
