import React, { useState } from "react";
import { CheckCircle } from "react-bootstrap-icons";
import { SignUpUser } from "../../services/api/swiftlineService";
import { showToast } from "../../services/utils/ToastHelper";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import FormInput from "./FormInput";
import PasswordRequirements from "./PasswordRequirements"; // Ensure this component is themed
import { validatePassword } from "../../services/utils/authUtils";
import { useTheme } from "../../services/utils/useTheme"; // Import useTheme
import TurnstileWidget from "../common/TurnstileWidget";

const SignUp = ({ setShowAuthModal }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [
    hasAgreedToTermsOfServiceAndPrivacyPolicy,
    setHasAgreedToTermsOfServiceAndPrivacyPolicy,
  ] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false); // This seems to control the success message view
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const location = useLocation(); // Use useLocation
  const from = location.state?.from || localStorage.getItem("from") || null;
  const { darkMode } = useTheme(); // Use the theme hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validatePassword(password)) {
      showToast.error(
        "Password must be at least 6 characters long and contain at least one non-alphanumeric character and one digit."
      );
      setIsLoading(false);
      return;
    }

    if (!turnstileToken) {
      showToast.error("Please complete the security check");
      setIsLoading(false);
      return;
    }

    if (!hasAgreedToTermsOfServiceAndPrivacyPolicy) {
      showToast.error(
        "You must agree to the Terms of Service and Privacy Policy to sign up."
      );
      setIsLoading(false);
      return;
    }

    try {
      const signUpRequest = {
        email,
        password,
        fullName,
        turnstileToken,
        hasAgreedToTermsOfServiceAndPrivacyPolicy,
      };
      const response = await SignUpUser(signUpRequest);

      // Assuming response.data.data.status is a boolean for success
      if (!response.data?.data?.status) {
        // Check for explicit false
        showToast.error(response.data.data.message || "Sign up failed.");
      } else {
        //saveAuthTokens(response);
        //handleAuthSuccess(response, navigate, from);
        //setShowAuthModal(null);
        showToast.success(
          "Almost done! Check your email (including spam folder) and follow the instructions."
        ); // Updated message
        setIsFormSubmitted(true); // Show success message after successful sign up
      }
    } catch (error) {
      console.error("Error during sign up:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {

     if (!turnstileToken) {
      showToast.error("Please complete the security check");
      setIsLoading(false);
      return;
    }

     if (!hasAgreedToTermsOfServiceAndPrivacyPolicy) {
      showToast.error(
        "You must agree to the Terms of Service and Privacy Policy to sign up."
      );

      setIsLoading(false);
      return;
    }
    const apiUrl = import.meta.env.VITE_API_URL;
    window.location.href = `${apiUrl}Auth/LoginWithGoogle`;
  };

  return (
    <div className="space-y-6">
      {" "}
      {/* Increased space-y */}
      {isFormSubmitted ? (
        <div
          className={`p-4 rounded-lg border flex items-start gap-3 transition-colors duration-300
          ${
            darkMode
              ? "bg-sage-900 border-sage-700 text-sage-200"
              : "bg-sage-100 border-sage-200 text-black"
          }
        `}
        >
          <CheckCircle
            className={`flex-shrink-0 mt-0.5 ${
              darkMode ? "text-sage-400" : "text-black"
            }`}
          />
          <div>
            <p className="text-sm">
              Almost done! Check your email (including spam folder) and follow
              the instructions.
              <br />
              Contact support if you need help.
            </p>
            <button
              onClick={() => {
                setShowAuthModal(null);
              }}
              className={`mt-3 text-sm font-medium transition-colors duration-200
                ${
                  darkMode
                    ? "text-sage-400 hover:text-sage-300"
                    : "text-sage-600 hover:text-sage-700"
                }
              `}
            >
              Continue to app
            </button>
          </div>
        </div>
      ) : (
        <div className="max-h-[80vh] overflow-y-auto">
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className={`w-full flex items-center justify-center px-4 py-2.5 border rounded-lg shadow-sm text-base font-medium transition-colors duration-200
            ${
              darkMode
                ? "border-gray-600 bg-gray-700 text-gray-100 hover:bg-gray-600"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }
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
              Sign Up with Google
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div
                className={`w-full border-t ${
                  darkMode ? "border-gray-600" : "border-gray-300"
                }`}
              ></div>
            </div>
            <div className="relative flex justify-center text-sm mt-4">
              <span
                className={`px-2 ${
                  darkMode
                    ? "bg-gray-800 text-gray-400"
                    : "bg-white text-gray-500"
                }`}
              >
                Or continue with email and password
              </span>
            </div>
          </div>
          <form className="space-y-4 mt-1" onSubmit={handleSubmit}>
            {" "}
            {/* Increased space-y */}
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
            <PasswordRequirements password={password} darkMode={darkMode} />{" "}
            {/* Pass darkMode prop */}
            <div className="flex justify-center">
              <TurnstileWidget setTurnstileToken={setTurnstileToken} />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10">
                <input
                  id="checkbox"
                  type="checkbox"
                  onClick={() =>
                    setHasAgreedToTermsOfServiceAndPrivacyPolicy(
                      !hasAgreedToTermsOfServiceAndPrivacyPolicy
                    )
                  }
                  role="checkbox"
                  aria-checked={hasAgreedToTermsOfServiceAndPrivacyPolicy}
                  className={`text-sm ${
                    darkMode ? "text-sage-400" : "text-sage-600"
                  }`}
                ></input>
              </div>
              <div className="">
                <label className="text-xs">
                  <span
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    By checking this box, you agree to our{" "}
                    {/* Use a simple <span> with an onClick handler to open the URL in a new window */}
                    <span
                      onClick={() => window.open("/tos.pdf", "_blank")}
                      className={`font-medium ${
                        darkMode
                          ? "text-sage-400 hover:text-sage-300"
                          : "text-sage-600 hover:text-sage-800"
                      } underline cursor-pointer`}
                    >
                      Terms of Service
                    </span>{" "}
                    and acknowledge that you have read our{" "}
                    <span
                      onClick={() => window.open("/privacy.pdf", "_blank")}
                      className={`font-medium ${
                        darkMode
                          ? "text-sage-400 hover:text-sage-300"
                          : "text-sage-600 hover:text-sage-800"
                      } underline cursor-pointer`}
                    >
                      Privacy Policy
                    </span>
                    .
                  </span>
                </label>
              </div>
            </div>
            <button
              type="submit"
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white transition-all duration-200
              ${
                darkMode
                  ? "bg-sage-600 hover:bg-sage-700 focus:ring-sage-500 focus:ring-offset-gray-800"
                  : "bg-sage-500 hover:bg-sage-600 focus:ring-sage-500 focus:ring-offset-white"
              }
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${isLoading ? "opacity-70 cursor-not-allowed" : ""}
            `}
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : null}
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SignUp;
