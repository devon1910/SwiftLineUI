import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import { loginUser } from "../services/swiftlineService";
import { Alert, Button, InputGroup, Spinner } from "react-bootstrap";
import { Eye, EyeSlashFill } from "react-bootstrap-icons";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigator = useNavigate();
  const handleLogin = (e) => {
    e.preventDefault();
    // Add your login logic here.
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }
    const loginRequest = { email, password };
    loginUser(loginRequest)
      .then((response) => {
        navigator("/", {
            state: { 
              email: response.data.email,
              isInLine: response.data.isInLine,
              userId: response.data.userId
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
            className="w-full px-3 py-2 text-black pr-10 border border-sage-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
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


