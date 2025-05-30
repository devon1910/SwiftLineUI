import React, { useState } from "react";
import { CheckCircle } from "react-bootstrap-icons";
import { SignUpUser } from "../../services/api/swiftlineService";
import { showToast } from "../../services/utils/ToastHelper";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import FormInput from "./FormInput";
import PasswordRequirements from "./PasswordRequirements"; // Ensure this component is themed
import { validatePassword, } from "../../services/utils/authUtils";
import { useTheme } from "../../services/utils/useTheme"; // Import useTheme
import TurnstileWidget from "../common/TurnstileWidget";

const SignUp = ({ setShowAuthModal }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false); // This seems to control the success message view
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const location = useLocation(); // Use useLocation
  const from = location.state?.from || localStorage.getItem("from") || null;
  const { darkMode } = useTheme(); // Use the theme hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!turnstileToken) {
      showToast.error("Please complete the security check");
      setIsLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      showToast.error(
        "Password must be at least 6 characters long and contain at least one non-alphanumeric character and one digit."
      );
      setIsLoading(false);
      return;
    }

    try {
      const signUpRequest = { email, password, fullName, turnstileToken };
      const response = await SignUpUser(signUpRequest);

      // Assuming response.data.data.status is a boolean for success
      if (!response.data?.data?.status) { // Check for explicit false
        showToast.error(response.data.data.message || "Sign up failed.");
      } else {
        //saveAuthTokens(response);
        //handleAuthSuccess(response, navigate, from);
        //setShowAuthModal(null);
        showToast.success("Almost done! Check your email (including spam folder) and follow the instructions."); // Updated message
        setIsFormSubmitted(true); // Show success message after successful sign up
      }
    } catch (error) {
      console.error("Error during sign up:", error);
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6"> {/* Increased space-y */}
      {isFormSubmitted ? (
        <div className={`p-4 rounded-lg border flex items-start gap-3 transition-colors duration-300
          ${darkMode ? "bg-sage-900 border-sage-700 text-sage-200" : "bg-sage-100 border-sage-200 text-black"}
        `}>
          <CheckCircle className={`flex-shrink-0 mt-0.5 ${darkMode ? "text-sage-400" : "text-black"}`} />
          <div>
            <p className="text-sm">
              Almost done! Check your email (including spam folder) and follow the instructions.
              <br />
              Contact support if you need help.
            </p>
            <button
              onClick={() => { /* Optionally reset form or navigate */ setShowAuthModal(null); }}
              className={`mt-3 text-sm font-medium transition-colors duration-200
                ${darkMode ? "text-sage-400 hover:text-sage-300" : "text-sage-600 hover:text-sage-700"}
              `}
            >
              Continue to app
            </button>
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}> {/* Increased space-y */}
          <FormInput
            id="fname"
            label="Full Name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            darkMode={darkMode} // Pass darkMode prop
          />

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
            autoComplete="new-password"
            showPasswordToggle
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            darkMode={darkMode} // Pass darkMode prop
          />

          <PasswordRequirements password={password} darkMode={darkMode} /> {/* Pass darkMode prop */}

          <div className="flex justify-center">
            <TurnstileWidget setTurnstileToken={setTurnstileToken}       
            />
          </div>

          <button
            type="submit"
            className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white transition-all duration-200
              ${darkMode ? "bg-sage-600 hover:bg-sage-700 focus:ring-sage-500 focus:ring-offset-gray-800" : "bg-sage-500 hover:bg-sage-600 focus:ring-sage-500 focus:ring-offset-white"}
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${isLoading ? "opacity-70 cursor-not-allowed" : ""}
            `}
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>
      )}
    </div>
  );
};

export default SignUp;