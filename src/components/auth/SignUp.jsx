import React, { useState } from "react";

import { CheckCircle, Eye, EyeSlashFill } from "react-bootstrap-icons";

import { toast } from "react-toastify";
import LoadingSpinner from "../common/LoadingSpinner";
import { motion } from "framer-motion";
import { SignUpUser } from "../../services/api/swiftlineService";
import TurnstileWidget from "../common/TurnstileWidget";
import { Bot } from "lucide-react";
import { BotCheck_Error_Message } from "../../services/utils/constants";

const apiUrl = import.meta.env.VITE_API_URL;


const SignUp = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [isTurnstileVerified, setIsTurnstileVerified] = useState(false);
  const handleGoogleSignIn = async () => {
    if (!isTurnstileVerified) {
       alert(BotCheck_Error_Message);
       return;
     }
   window.location.href = apiUrl+ "Auth/LoginWithGoogle";
  };
  function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true)
    if (!isTurnstileVerified) {
      alert(BotCheck_Error_Message);
      return;
    }
   
    const signUpRequest = { email, password };
    SignUpUser(signUpRequest)
      .then((response) => {
        setIsFormSubmitted(true);
      })
      .catch((error) => {
        toast.error(error.response.data.data.message);
        console.log("err: ",error);
      });
      setIsLoading(false)
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
    ):( 
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
              Or create account with email and password
            </span>
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-black">Create your account</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            className="mt-1 block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sage-500 focus:border-sage-500"
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
            name="password"
            type={showPassword ? "text" : "password"}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="mt-1 block text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sage-500 focus:border-sage-500"
          />
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
        </div>
        <TurnstileWidget setIsTurnstileVerified={setIsTurnstileVerified}/>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sage-600 hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-500"
          disabled={isLoading}
        >
          Create account
        </button>
      </form>
    </div>
    )}
    </div>
  )
};

export default SignUp;
