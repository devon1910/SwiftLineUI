import React, { useState } from "react";
import Login from "./Login";
import SignUp from "./SignUp";
import PasswordReset from "./PasswordReset";

const AuthForm = ({setShowAuthModal}) => {
  const [activeTab, setActiveTab] = useState("login");
  const [resetPassword, setResetPassword] = useState(false);

  // Reset password handler
  const handleResetPassword = () => {
    setResetPassword(true);
    setActiveTab("login");
  };

  // Back to login handler
  const handleBackToLogin = () => {
    setResetPassword(false);
  };

  return (
    <div className="w-full max-w-md bg-white auth-card rounded-xl overflow-hidden">
      <div className="p-4 md:p-6">
        {!resetPassword ? (
          <>
            <div className="auth-tabs flex">
              <button
                onClick={() => setActiveTab("login")}
                className={`auth-tab-button login ${
                  activeTab === "login" ? "active" : ""
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab("signup")}
                className={`auth-tab-button signup ${
                  activeTab === "signup" ? "active" : ""
                }`}
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
            <div className="auth-content">
              {activeTab === "login" ? (
                <Login onResetPassword={handleResetPassword} />
              ) : (
                <SignUp />
              )}
            </div>
          </>
        ) : (
          <div className="auth-content">
            <PasswordReset onBackToLogin={handleBackToLogin} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
