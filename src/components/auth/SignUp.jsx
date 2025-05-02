import React, { useState } from "react";
import { CheckCircle } from "react-bootstrap-icons";
import { SignUpUser } from "../../services/api/swiftlineService";
import { showToast } from "../../services/utils/ToastHelper";
import { useNavigate } from "react-router-dom";
import FormInput from "./FormInput";
import PasswordRequirements from "./PasswordRequirements";
import { validatePassword, saveAuthTokens, handleAuthSuccess } from "../../services/utils/authUtils";

const SignUp = ({ setShowAuthModal }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const from = location.state?.from || localStorage.getItem("from") || null;

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

    try {
      const signUpRequest = { email, password, fullName };
      const response = await SignUpUser(signUpRequest);
      
      if (!response.data.data.status) {
        showToast.error(response.data.data.message);
      } else {
        saveAuthTokens(response);
        handleAuthSuccess(response, navigate, from);
        setShowAuthModal(null);
      }
    } catch (error) {
      showToast.error(error.response?.data?.data?.message || "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {isFormSubmitted ? (
        <div className="bg-sage-100 p-4 rounded-lg border border-sage-200 flex items-center gap-3">
          <CheckCircle className="flex-shrink-0 text-black" />
          <div>
            <p className="text-sm text-black">
              Almost done! Check your email (including spam folder) for the
              welcome message and follow the instructions.
              <br />
              Contact support if you need help.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <form className="space-y-2" onSubmit={handleSubmit}>
            <FormInput
              id="fname"
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />

            <FormInput
              id="email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
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
            />

            <PasswordRequirements password={password} />

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sage-600 hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-500"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SignUp;
