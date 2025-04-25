import React, { useState } from "react";
import Login from "./Login";
import SignUp from "./SignUp";
import PasswordReset from "./PasswordReset";

const AuthForm = () => {
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
    <div className="min-h-screen auth-container flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white auth-card rounded-xl overflow-hidden">
        {!resetPassword ? (
          <>
            <div className="auth-tabs">
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
