import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import { loginUser } from "../services/swiftlineService";
import { Alert, Button, InputGroup, Spinner } from "react-bootstrap";
import { Eye, EyeSlashFill } from "react-bootstrap-icons";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


// Container that centers the login card vertically and horizontally
const LoginWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f9f9f9;
`;

// Login card styling
const LoginCard = styled.div`
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

// Styled form floating group for inputs
const StyledFormFloating = styled(Form.Floating)`
  margin-bottom: 20px;
`;

// Styled input control with sage green border and focus effect
const StyledFormControl = styled(Form.Control)`
  border: 2px solid #698474;
  border-radius: 6px;
  font-family: "Inter", sans-serif;
  &:focus {
    border-color: #698474;
    box-shadow: 0 0 5px rgba(105, 132, 116, 0.3);
  }
`;

// Toggle icon styling for password visibility
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

// Styled button using SwiftLine sage green
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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigator = useNavigate();
  const handleLogin = (e) => {
    e.preventDefault();
    // Add your login logic here.
    const loginRequest = { email, password };
    loginUser(loginRequest)
      .then((response) => {
        navigator("/LandingPage", {
            state: { 
              userId: response.data.userId,
              email: response.data.email,
              isInLine: response.data.isInLine
            }
        });
      })
      .catch((error) => {      
       console.log("error: ", error.message);
       toast.error(error.data.message);
      });
  };
  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-900">Welcome Back</h2>

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
            className="w-full px-3 py-2 border border-sage-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
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
            className="w-full px-3 py-2 pr-10 border border-sage-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
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
        Login
      </button>
    </form>
  );
};

export default Login;


