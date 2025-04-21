import React, { useState, useEffect } from "react";
import { loginUser } from "../../services/api/swiftlineService";
import { Eye, EyeSlashFill } from "react-bootstrap-icons";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { showToast } from "../../services/utils/ToastHelper";

const Login = ({ onResetPassword }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigator = useNavigate();
  const location = useLocation();
  const from = location.state?.from || null;

  useEffect(() => {
    if (window.turnstile) {
      window.turnstile.render(
        document.querySelector(".cf-turnstile"),
        {
          sitekey: "0x4AAAAAABQ5zE_ortY2Kehw",
          theme: "light",
        }
      );
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    // Add your login logic here.
    if (!email || !password) {
      showToast.error("Please enter email and password.");
      return;
    }

    loginUser({ email, password })
      .then((response) => {
        const valueToken = JSON.stringify(response.data.data.accessToken);
        const refreshToken = JSON.stringify(response.data.data.refreshToken);
        localStorage.setItem("user", valueToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userName", response.data.data.userName);
        localStorage.setItem(
          "userId",
          JSON.stringify(response.data.data.userId)
        );
        if (from) {
          window.location.href = from;
        } else {
          navigator("/", {
            state: {
              email: response.data.data.email,
              isInLine: response.data.data.isInLine,
              userId: response.data.data.userId,
              userName: response.data.data.userName,
            },
            replace: true,
          });
        }
      })
      .catch((error) => {
        showToast.error(error.response.data.data.message);
      });
  };
  const apiUrl = import.meta.env.VITE_API_URL;
  const handleGoogleSignIn = async () => {
    window.location.href = apiUrl + "Auth/LoginWithGoogle";
  };

  return (
    <div className="space-y-6">
      <div className="mt-6">
        <button
          type="button"
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700  hover:bg-gray-50"
          onClick={handleGoogleSignIn}
        >
          <svg
            className="h-5 w-5 mr-2"
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
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with email and password
            </span>
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-black">Welcome back</h2>
      <form className="space-y-4" onSubmit={handleLogin}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sage-500 focus:border-sage-500"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sage-500 focus:border-sage-500"
          />
          
        </div>
        <div className="checkbox mb-3">
          <div
            className="cf-turnstile"
            data-sitekey="0x4AAAAAABQ5zE_ortY2Kehw"
            data-theme="light"
          ></div>
        </div>
       
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye /> : <EyeSlashFill />}
            </button>
          </div>
          {/* <button
            type="button"
            onClick={onResetPassword}
            className="text-sm font-medium text-sage-600 hover:text-sage-700"
          >
            Forgot password?
          </button> */}
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sage-600 hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-500"
        >
          Sign in
        </button>
      </form>
    </div>
  );
};

export default Login;
