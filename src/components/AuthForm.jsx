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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        {!resetPassword ? (
          <>
            <div className="flex border-b border-sage-200">
              <button
                onClick={() => setActiveTab("login")}
                className={`flex-1 p-4 text-lg font-medium transition-colors ${
                  activeTab === "login"
                    ? "text-sage-600 border-b-2 border-sage-600"
                    : "text-gray-500 hover:bg-sage-50"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab("signup")}
                className={`flex-1 p-4 text-lg font-medium transition-colors ${
                  activeTab === "signup"
                    ? "text-sage-600 border-b-2 border-sage-600"
                    : "text-gray-500 hover:bg-sage-50"
                }`}
              >
                Sign Up
              </button>
            </div>
            <div className="p-6 md:p-8">
              {activeTab === "login" ? (
                <Login onResetPassword={handleResetPassword} />
              ) : (
                <SignUp />
              )}
            </div>
          </>
        ) : (
          <div className="p-6 md:p-8">
            <PasswordReset onBackToLogin={handleBackToLogin} />
          </div>
        )}
      </div>
    </div>
  );
};


export default AuthForm;
