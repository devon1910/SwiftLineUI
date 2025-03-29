import React, { useState } from "react";
import { Form, Button, InputGroup, Alert } from "react-bootstrap";
import styled from "styled-components";
import { Eye, EyeSlashFill } from "react-bootstrap-icons";
import { SignUpUser } from "../services/swiftlineService";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import LoadingSpinner from "./LoadingSpinner";
import { CheckCircle } from "lucide-react";

// Wrapper to center the signup card vertically and horizontally
const SignUpWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f9f9f9;
`;

// Card styling for the signup form
const SignUpCard = styled.div`
  background-color: #fff;
  border-radius: 10px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 400px;
  position: relative;
`;

// Title styling for the form
const FormTitle = styled.h3`
  font-family: "Inter", sans-serif;
  color: black;
  margin-bottom: 20px;
  text-align: center;
`;

// Styled floating input group for spacing and alignment
const StyledFormFloating = styled(Form.Floating)`
  margin-bottom: 20px;
`;

// Input styling with sage green borders and focus effects
const StyledFormControl = styled(Form.Control)`
  border: 2px solid #698474;
  border-radius: 6px;
  font-family: "Inter", sans-serif;
  &:focus {
    border-color: #698474;
    box-shadow: 0 0 5px rgba(105, 132, 116, 0.3);
  }
`;

// Icon styling for toggling password visibility
const ToggleIcon = styled(InputGroup.Text)`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  z-index: 5;
  background-color: transparent;
  border: none;
`;

// Styled submit button using SwiftLine's signature sage green
const StyledButton = styled(Button)`
  background-color: #698474;
  border: none;
  font-family: "Inter", sans-serif;
  width: 100%;
  margin-top: 20px;
  &:hover {
    background-color: #556c60;
  }
`;

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true)
    const signUpRequest = { email, password };
    SignUpUser(signUpRequest)
      .then((response) => {
        setIsFormSubmitted(true);
        setIsLoading(false)
      })
      .catch((error) => {
        
        if (error.data) {
          console.log("error: ", error.message);
          toast.error(error.data.message);
        } else {
          toast.error("Something went wrong. Please try again later.");
        }
        setIsLoading(false)
      });
  }

  return (
    <div className="space-y-6">
      {isLoading && (
        <motion.div
          // ... existing motion props
          className="fixed inset-0 bg-white/70 flex items-center justify-center z-50"
        >
          <LoadingSpinner message="Creating your account..." />
        </motion.div>
      )}

      {isFormSubmitted ? (
        <div className="bg-sage-100 p-4 rounded-lg border border-sage-200 flex items-center gap-3">
          <CheckCircle className="flex-shrink-0 text-black" />
          <div>
            <p className="text-sm text-black">
              Almost done! Check your email (including spam folder) for the welcome message and follow the instructions.<br/>
              Contact support if you need help.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-gray-900">Get Started</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-black border border-sage-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                placeholder="name@example.com"
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 text-black border border-sage-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                placeholder="******"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-7 text-sage-500 hover:text-sage-600"
              >
                {showPassword ? <EyeSlashFill /> : <Eye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-sage-600 text-white py-2 px-4 rounded-lg hover:bg-sage-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2"
          >
            Create Account
          </button>
        </form>
      )}
    </div>
  );
  
};

export default SignUp;
