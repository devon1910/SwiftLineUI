import React, { useState } from "react";
import { loginUser } from "../../services/api/swiftlineService";
import { useLocation, useNavigate } from "react-router-dom";
import { showToast } from "../../services/utils/ToastHelper";
import {
  handleAuthSuccess,
  saveAuthTokens,
} from "../../services/utils/authUtils";
import FormInput from "./FormInput";
import { useTheme } from "../../services/utils/useTheme"; // Import useTheme
import TurnstileWidget from "../common/TurnstileWidget";

const Login = ({ onResetPassword, setShowAuthModal }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const navigator = useNavigate();
  const location = useLocation();
  const from = location.state?.from || localStorage.getItem("from") || null;
  const { darkMode } = useTheme(); // Use the theme hook

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("turnstileToken: ",turnstileToken)
    if (!turnstileToken) {
      showToast.error("Please complete the security check");
      return;
    }

    try {
      const response = await loginUser({ email, password, turnstileToken });
      saveAuthTokens(response);
      handleAuthSuccess(response, navigator, from);
      setShowAuthModal(null);
      showToast.success("Logged in successfully!"); // Added success toast
    } catch (error) {
      console.error("Login error:", error); // Use console.error
      // Enhanced error message based on common auth issues
    }
  };

  const handleGoogleSignIn = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    window.location.href = `${apiUrl}Auth/LoginWithGoogle`;
  };

  return (
    <div className="space-y-6"> {/* Increased space-y for better visual separation */}
      <div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className={`w-full flex items-center justify-center px-4 py-2.5 border rounded-lg shadow-sm text-base font-medium transition-colors duration-200
            ${darkMode ? "border-gray-600 bg-gray-700 text-gray-100 hover:bg-gray-600" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}
          `}
        >
          <svg
            className="h-5 w-5 mr-3" // Increased margin
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            />
          </svg>
          Sign in with Google
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className={`w-full border-t ${darkMode ? "border-gray-600" : "border-gray-300"}`}></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className={`px-2 ${darkMode ? "bg-gray-800 text-gray-400" : "bg-white text-gray-500"}`}>
            Or continue with email and password
          </span>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleLogin}> {/* Increased space-y */}
        <FormInput
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          darkMode={darkMode} // Pass darkMode prop
        />

        <FormInput
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password" // Changed to current-password for login
          showPasswordToggle
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          darkMode={darkMode} // Pass darkMode prop
        />

        <div className="text-right">
          <button
            type="button"
            onClick={onResetPassword}
            className={`text-sm font-medium transition-colors duration-200
              ${darkMode ? "text-sage-400 hover:text-sage-300" : "text-sage-600 hover:text-sage-700"}
            `}
          >
            Forgot password?
          </button>
        </div>

        <div className="flex justify-center">
          <TurnstileWidget setTurnstileToken={setTurnstileToken}   />
        </div>

        <button
          type="submit"
          className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white transition-all duration-200
            ${darkMode ? "bg-sage-600 hover:bg-sage-700 focus:ring-sage-500 focus:ring-offset-gray-800" : "bg-sage-500 hover:bg-sage-600 focus:ring-sage-500 focus:ring-offset-white"}
            focus:outline-none focus:ring-2 focus:ring-offset-2
          `}
        >
          Sign in
        </button>
      </form>
    </div>
  );
};

export default Login;